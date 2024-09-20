const User = require('../model/users'); // Adjust the path as needed
const Question = require('../model/question'); // Adjust the path as needed
const Answer = require('../model/Answer'); // Adjust the path as needed
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../logger'); // Adjust the path as necessary
const { broadcastInactiveUsers } = require('./admin'); 
const mongoose = require('mongoose');
const Category = require('../model/category');

exports.loginUser = async (req, res) => {
    try {
        const { email, password, question } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn('Login failed: User not found', { email });
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logger.warn('Login failed: Invalid credentials', { email });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update the last login date
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Fetch all questions for the logged-in user
        const questions = await Question.find({ createdBy: user._id });

        // Fetch all answers for the logged-in user
        const answers = await Answer.find({ userId: user._id });

        // Check if a provided question matches any stored question
        let matchedAnswer = 'No matching answer found';
        if (question) {
            const matchedQuestion = await Question.findOne({
                createdBy: user._id,
                question: new RegExp(question, 'i') // Case-insensitive match
            });

            if (matchedQuestion) {
                const answer = await Answer.findOne({
                    questionId: matchedQuestion._id,
                    userId: user._id
                });
                matchedAnswer = answer ? answer.answer : matchedAnswer;
            }
        }

        // Send notifications to inactive users
        await broadcastInactiveUsers();

        // Return user details along with their questions and answers
        logger.info('Login successful', { userId: user._id, token });
        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                name: user.username, // Adjust this if needed
                token,
                lastLogin: user.lastLogin // Include lastLogin in the response
            },
            questions,
            answers, // Include answers in the response
            matchedAnswer
        });

    } catch (error) {
        logger.error('Error during login', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

// User registration
exports.createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            logger.warn('User creation failed: Missing required fields', { username, email });
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        // Validate email format
        const validationEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!validationEmail.test(email)) {
            logger.warn('User creation failed: Invalid email format', { email });
            return res.status(400).json({ message: 'Invalid email' });
        }

        // Validate password format
        const validationPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!validationPassword.test(password)) {
            logger.warn('User creation failed: Invalid password format', { email });
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.warn('User creation failed: Email already in use', { email });
            return res.status(409).json({ message: 'Email already in use' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();

        // Generate and return a JWT token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        logger.info('User created successfully', { userId: newUser._id });
        return res.status(201).json({
            message: 'User created successfully',
            username: newUser.username,
            email: newUser.email,
            token
        });

    } catch (error) {
        logger.error('Error during user creation', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

// Ask a question
/**
 * Ask a new question
 */
exports.askQuestion = async (req, res) => {
    try {
        const { userId, questionText, category } = req.body;

        // Validate input
        if (!userId || !questionText || !category) {
            logger.warn('Question asking failed: Missing required fields', { userId });
            return res.status(400).json({ message: 'All fields are required: userId, questionText, and category' });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('Question asking failed: User not found', { userId });
            return res.status(404).json({ message: 'User not found' });
        }

        // Save the question with category
        const newQuestion = new Question({
            userId,
            question: questionText,
            category // Include category here
        });
        await newQuestion.save();

        // Find the answer
        let answerText = 'No matching answer found';
        const matchedQuestion = await Question.findOne({
            userId,
            question: new RegExp(questionText, 'i') // Case-insensitive match
        });

        if (matchedQuestion) {
            const answer = await Answer.findOne({
                questionId: matchedQuestion._id,
                userId
            });
            answerText = answer ? answer.answer : answerText;
        }

        logger.info('Question asked successfully', { userId, questionId: newQuestion._id });
        return res.status(200).json({
            message: 'Question asked successfully',
            question: newQuestion,
            answer: answerText
        });

    } catch (error) {
        logger.error('Error asking question', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};



exports.answerQuestion = async (req, res) => {
    try {
        const { userId, questionId, answerText, category } = req.body;

        // Validate input
        if (!userId || !questionId || !answerText || !category) {
            logger.warn('Answer creation failed: Missing required fields', { userId, questionId });
            return res.status(400).json({ message: 'User ID, question ID, answer text, and category are required' });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('Answer creation failed: User not found', { userId });
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the question
        const question = await Question.findById(questionId);
        if (!question) {
            logger.warn('Answer creation failed: Question not found', { questionId });
            return res.status(404).json({ message: 'Question not found' });
        }

        // Save the answer with the category
        const newAnswer = new Answer({
            userId,
            questionId,
            answerText,
            category // Include category here
        });
        await newAnswer.save();

        logger.info('Answer saved successfully', { userId, questionId, answerId: newAnswer._id });
        return res.status(200).json({
            message: 'Answer saved successfully',
            answer: newAnswer
        });

    } catch (error) {
        logger.error('Error answering question', { error });
        return res.status(500).json({ message: 'Server error' });
    }

}
// Update an answer
exports.updateAnswer = async (req, res) => {
    try {
        const { userId, questionId, answerId, answerText } = req.body;

        // Validate input
        if (!userId || !questionId || !answerId || !answerText) {
            logger.warn('Answer update failed: Missing required fields', { userId, questionId, answerId });
            return res.status(400).json({ message: 'User ID, question ID, answer ID, and answer text are required' });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('Answer update failed: User not found', { userId });
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the question
        const question = await Question.findById(questionId);
        if (!question) {
            logger.warn('Answer update failed: Question not found', { questionId });
            return res.status(404).json({ message: 'Question not found' });
        }

        // Update the answer
        const answer = await Answer.findByIdAndUpdate(answerId, { answer: answerText }, { new: true });
        if (!answer) {
            logger.warn('Answer update failed: Answer not found', { answerId });
            return res.status(404).json({ message: 'Answer not found' });
        }

        logger.info('Answer updated successfully', { userId, questionId, answerId });
        return res.status(200).json({
            message: 'Answer updated successfully',
            answer
        });

    } catch (error) {
        logger.error('Error updating answer', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

// Delete an answer
exports.deleteAnswer = async (req, res) => {
    try {
        const { userId, answerId } = req.body;

        // Validate input
        if (!userId || !answerId) {
            logger.warn('Answer deletion failed: Missing required fields', { userId, answerId });
            return res.status(400).json({ message: 'User ID and answer ID are required' });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('Answer deletion failed: User not found', { userId });
            return res.status(404).json({ message: 'User not found' });
        }

        // Find and delete the answer
        const answer = await Answer.findByIdAndDelete(answerId);
        if (!answer) {
            logger.warn('Answer deletion failed: Answer not found', { answerId });
            return res.status(404).json({ message: 'Answer not found' });
        }

        logger.info('Answer deleted successfully', { userId, answerId });
        return res.status(200).json({
            message: 'Answer deleted successfully'
        });

    } catch (error) {
        logger.error('Error deleting answer', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};


exports.createQuestionAndAnswer = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request params:', req.params);

        const { questionText, answerText, category } = req.body;
        const { userId } = req.params; // Extract userId from URL params

        // Validate input
        if (!userId || !questionText || !answerText || !category) {
            return res.status(400).json({ message: 'User ID, question text, answer text, and category name are required' });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find or create the category
        let categoryDoc = await Category.findOne({ categoryName: category });
        if (!categoryDoc) {
            categoryDoc = new Category({ categoryName: category });
            await categoryDoc.save();
        }

        // Add the question and answer to the category document
        categoryDoc.questions.push({ questionText, answerText });

        // Save the updated category document
        await categoryDoc.save();

        // Create and save the new question
        const newQuestion = new Question({
            question: questionText,
            answer: answerText,
            createdBy: userId,
            category: categoryDoc._id
        });
        await newQuestion.save();

        // Create and save the new answer
        const newAnswer = new Answer({
            questionId: newQuestion._id,
            answerText,
            createdBy: userId,
        });
        await newAnswer.save();

        // Link the answer to the question
        newQuestion.answers.push(newAnswer._id);
        await newQuestion.save();

        // Get the total number of questions in the category
        const numberOfQuestions = categoryDoc.questions.length;

        // Return response
        return res.status(201).json({
            message: 'Question and answer created successfully and added to category',
            question: newQuestion,
            answer: newAnswer,
            category: categoryDoc,
            numberOfQuestions: numberOfQuestions // Include the number of questions in the category
        });

    } catch (error) {
        console.error('Error creating question and answer:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};






// POST /api/user/create-question-answer
exports.createQuestionAndAnswer2 = async (req, res) => {
    try {
        const { userId, questionText, answerText, category } = req.body;

        // Validate input
        if (!userId || !questionText || !answerText || !category) {
            logger.warn('Question and answer creation failed: Missing required fields', { userId, questionText, answerText, category });
            return res.status(400).json({ message: 'User ID, question text, answer text, and category are required' });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('Question and answer creation failed: User not found', { userId });
            return res.status(404).json({ message: 'User not found' });
        }

        // Create and save the question
        const newQuestion = new Question({
            question: questionText,
            createdBy: userId,
            category,
            answers: [] // Initialize as an empty array
        });
        await newQuestion.save();

        // Create and save the answer
        const newAnswer = new Answer({
            questionId: newQuestion._id,
            answerText,
            createdBy: userId,
        });
        await newAnswer.save();

        // Update the question's answers array to include the new answer
        newQuestion.answers.push(newAnswer._id);
        await newQuestion.save(); // Save the question after updating its answers array

        logger.info('Question and answer created successfully', { userId, questionId: newQuestion._id, answerId: newAnswer._id });
        return res.status(201).json({
            message: 'Question and answer created successfully',
            question: newQuestion,
            answer: newAnswer
        });

    } catch (error) {
        logger.error('Error creating question and answer', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getALLQA = async (req, res) => {
    try {
        const { userId, category } = req.params;

        // Find the category
        const categoryDoc = await Category.findOne({ categoryName: category });
        if (!categoryDoc) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Find questions in the category
        const questions = await Question.find({ category: categoryDoc._id })
            .populate({
                path: 'answers',
                select: 'answerText isCorrect createdAt' // Select the fields you want from the Answer model
            })
            .populate('createdBy', 'name') // Optionally populate user details if needed
            .exec();

        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions found in the category' });
        }

        // Fetch user's answers for these questions
        const questionIds = questions.map(q => q._id);
        const userAnswers = await Answer.find({ questionId: { $in: questionIds }, createdBy: userId });
        
        // Calculate progress
        const answeredQuestionIds = new Set(userAnswers.map(a => a.questionId.toString()));
        const totalQuestions = questions.length;
        const answeredQuestions = answeredQuestionIds.size;
        const progress = (answeredQuestions / totalQuestions) * 100;

        // Format response
        const formattedQuestions = questions.map(q => ({
            questionText: q.question,
            answers: q.answers.map(a => ({
                answerText: a.answerText,
                isCorrect: a.isCorrect,
                createdAt: a.createdAt
            })),
            createdBy: q.createdBy // Optionally include user details if populated
        }));

        return res.status(200).json({
            questions: formattedQuestions,
            progress: `${progress.toFixed(2)}%` // Include progress in response
        });
    } catch (error) {
        console.error('Error retrieving questions and answers:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};



 


// get category
// exports.getQuestionsAndAnswersByCategory = async (req, res) => {
//     try {
//         const { category } = req.params; // Extract category and userId from the URL parameters

//         // Validate input
//         if (!category) {
//             logger.warn('Category search failed: Missing category parameter');
//             return res.status(400).json({ message: 'Category is required' });
//         }

//         if (!userId) {
//             logger.warn('User ID search failed: Missing userId parameter');
//             return res.status(400).json({ message: 'User ID is required' });
//         }

//         // Build the query object to filter by category and userId
//         const query = {
//             category,
//             createdBy: userId  // Assuming `createdBy` field stores userId
//         };

//         // Find questions by category and userId
//         const questions = await Question.find(query);

//         if (questions.length === 0) {
//             return res.status(404).json({ message: 'No questions found for this category and user' });
//         }

//         // Find answers for the found questions
//         const questionIds = questions.map(question => question._id);
//         const answers = await Answer.find({ questionId: { $in: questionIds } });

//         logger.info('Questions and answers retrieved successfully', {
//             category,
//             userId,
//             questionCount: questions.length,
//             answerCount: answers.length
//         });

//         // Return response including category, userId, questions, and answers
//         return res.status(200).json({
//             message: 'Questions and answers retrieved successfully',
//             category,
//             userId,
//             questions,   // Include questions
//             answers      // Include answers
//         });

//     } catch (error) {
//         logger.error('Error retrieving questions and answers by category and user', { error });
//         return res.status(500).json({ message: 'Server error' });
//     }
// };



// // get all questions and answers by categoryconst Category = require('../models/Category'); // Adjust the path as necessary

exports.getAllCategories = async (req, res) => {
    try {
        // Fetch all distinct category names from the Category model
        const categoryNames = await Category.find().distinct('categoryName');

        // Check if any categories are found
        if (categoryNames.length === 0) {
            return res.status(404).json({ message: 'No categories found' });
        }

        // Return the category names
        return res.status(200).json({
            message: 'Categories retrieved successfully',
            categories: categoryNames
        });

    } catch (error) {
        // Log error and send a 500 response
        logger.error('Error fetching categories:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};




exports.getQuestionsAndAnswersFromCategory2 = async (req, res) => {
    try {
        const { categoryName, userId } = req.params; // Assuming both categoryName and userId are passed as URL parameters

        // Find the category by name and filter questions created by the user
        const category = await Category.findOne({ categoryName })
            .populate({
                path: 'questions',
                match: { createdBy: userId }, // Only return questions created by this user
                populate: {
                    path: 'answers',
                    model: 'Answer',
                    match: { createdBy: userId } // Only return answers created by the user
                }
            });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Initialize progress variables
        let totalQuestions = category.questions ? category.questions.length : 0;
        let correctAnswers = 0;

        // Check if the questions array exists and is not empty
        if (category.questions && category.questions.length > 0) {
            // Iterate through questions and count correct answers
            category.questions.forEach(question => {
                if (question.answers && question.answers.length > 0) {
                    question.answers.forEach(answer => {
                        if (answer.isCorrect) { // Assuming you have an 'isCorrect' field on answers
                            correctAnswers++;
                        }
                    });
                }
            });
        }

        // Calculate progress percentage
        const progress = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

        // Return the category name, questions, and progress
        return res.status(200).json({
            message: 'Category retrieved successfully',
            categoryName: category.categoryName, // Returning the category name
            questions: category.questions || [], // Returning the user's questions and answers
            progress: `${progress.toFixed(2)}%`, // Returning progress as a percentage
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers
        });
    } catch (error) {
        console.error('Error retrieving category', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};



exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'Email, new password, and confirm password are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        logger.info('Password reset successfully', { userId: user._id });
        return res.status(200).json({ message: 'Password reset successfully' });

    } catch (error) {
        logger.error('Error during password reset:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.forgotPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'Email, new password, and confirm password are required' });
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        logger.info('Password reset successfully for user', { userId: user._id });
        return res.status(200).json({ message: 'Password has been reset successfully' });

    } catch (error) {
        logger.error('Error during password reset', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// get all questions and answers by category
exports.getAllQuestionsAndAnswersByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        // Validate input
        if (!category) {
            logger.warn('Category search failed: Missing category parameter');
            return res.status(400).json({ message: 'Category is required' });
        }

        // Find questions by category
        const questions = await Question.find({ category });

        if (questions.length === 0) {
            logger.warn('No questions found for category', { category });
            return res.status(404).json({ message: 'No questions found for this category' });
        }

        // Find answers for the found questions
        const questionIds = questions.map(question => question._id);
        const answers = await Answer.find({ questionId: { $in: questionIds } });

        // Log the successful operation
        logger.info('All questions and answers retrieved successfully', {
            category,
            questionCount: questions.length,
            answerCount: answers.length
        });

        // Return the questions and their corresponding answers
        return res.status(200).json({
            message: 'Questions and answers retrieved successfully',
            questions,
            answers
        });

    } catch (error) {
        logger.error('Error retrieving all questions and answers by category', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};



// Get all questions and answers for a specific user
exports.getQuestionAndAnswers = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { page = 1, limit = 10 } = req.query; // Default values: page 1 and 10 items per page

        // Validate input
        if (!questionId) {
            logger.warn('Fetching questions and answers failed: Missing question ID', { questionId });
            return res.status(400).json({ message: 'Question ID is required' });
        }

        // Find the question
        const question = await Question.findById(questionId);
        if (!question) {
            logger.warn('Fetching questions and answers failed: Question not found', { questionId });
            return res.status(404).json({ message: 'Question not found' });
        }

        // Calculate total number of answers for the question
        const totalAnswers = await Answer.countDocuments({ questionId });

        // Find all answers related to the question with pagination
        const answers = await Answer.find({ questionId })
            .skip((page - 1) * limit) // Skip answers for previous pages
            .limit(parseInt(limit))   // Limit the number of answers returned per page

        // Return paginated data
        logger.info('Fetched questions and answers successfully', { questionId, pagination: { totalItems: totalAnswers, currentPage: parseInt(page), totalPages: Math.ceil(totalAnswers / limit), limit: parseInt(limit) } });
        return res.status(200).json({
            question,
            answers,
            pagination: {
                totalItems: totalAnswers,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalAnswers / limit),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        logger.error('Error fetching questions and answers', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async  (req, res) => {
    try {
        const { userId } = req.params;

        // Validate input
        if (!userId) {
            logger.warn('User deletion failed: Missing user ID', { userId });
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Find the user
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            logger.warn('User deletion failed: User not found', { userId });
            return res.status(404).json({ message: 'User not found' });
        }

        logger.info('User deleted successfully', { userId });
        return res.status(200).json({
            message: 'User deleted successfully'
        });

    } catch (error) {
        logger.error('Error deleting user', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.updateUser = async(req, res, next) => {
    try {
        const { userId } = req.params;
        const updatedUser = req.body;

        // Validate input
        if (!userId) {
            logger.warn('User update failed: Missing user ID', { userId });
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Find the user
        const user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });
        if (!user) {
            logger.warn('User update failed: User not found', { userId });
            return res.status(404).json({ message: 'User not found' });
        }

        logger.info('User updated successfully', { userId });
        return res.status(200).json({
            message: 'User updated successfully',
            user
        });

    } catch (error) {
        logger.error('Error updating user', { error });
        return res.status(200).json({message: 'User updated successfully'});
};
    }

    // Get all users
    exports.getUsers = async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query; // Default values: page 1 and 10 items per page
   
            // Calculate total number of users
            const totalUsers = await User.countDocuments();
   
            // Find all users with pagination
            const users = await User.find()
                .skip((page - 1) * limit) // Skip users for previous pages
                .limit(parseInt(limit));  // Limit the number of users returned per page
   
            // Return paginated data
            logger.info('Fetched users successfully', {
                pagination: {
                    totalItems: totalUsers,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalUsers / limit),
                    limit: parseInt(limit)
                }
            });
   
            return res.status(200).json({
                users,
                pagination: {
                    totalItems: totalUsers,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalUsers / limit),
                    limit: parseInt(limit)
                }
            });
   
        } catch (error) {
            logger.error('Error fetching users', { error });
            return res.status(500).json({ message: 'Server error' });
        }
    };
    exports.getAllAnswers = async(req, res)=>{
        try{
            const answers = await Answer.find();
            return res.status(200).json(answers);
        }
        catch(error){
            console.error(error);
            return res.status(500).json({message: 'Server error'});
        }
    }
    exports.getQuizQuestions = async (req, res) => {
        try {
            const { userId, category } = req.params; // Assuming both userId and category are passed as URL parameters
    
            // Check if both userId and category are provided
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }
    
            if (!category) {
                return res.status(400).json({ message: 'Category is required' });
            }
    
            // Fetch up to 10 questions by category and userId
            const questions = await Question.find({ category, createdBy: userId }).limit(10);
    
            // Check if no questions were found
            if (questions.length === 0) {
                return res.status(404).json({ message: 'No questions available in this category' });
            }
    
            // Get the IDs of the fetched questions
            const questionIds = questions.map(q => q._id);
    
            // Fetch answers associated with these questions by userId
            const answers = await Answer.find({ questionId: { $in: questionIds }, createdBy: userId });
    
            // Calculate progress based on answered questions
            const totalQuestions = questions.length;
            const answeredQuestions = answers.length;
            const progress = (answeredQuestions / totalQuestions) * 100;
    
            // Return the questions and progress
            return res.status(200).json({
                message: 'Quiz questions retrieved successfully',
                questions,
                progress: `${progress.toFixed(2)}%`, // Return progress as a percentage
                totalQuestions: totalQuestions,
                answeredQuestions: answeredQuestions
            });
        } catch (error) {
            console.error('Error fetching quiz questions:', error);
            return res.status(500).json({ message: 'Server error', error });
        }
    };


//     exports.submitTypedAnswer = async (req, res) => {
//     try {
//         const { userAnswer } = req.body;  // Single answer submitted as a string
//         const { userId, questionId } = req.params;  // User ID and questionId from the params

//         // Validate input
//         if (!userId || !questionId || typeof userAnswer !== 'string') {
//             return res.status(400).json({ message: 'User ID, question ID, and answer are required' });
//         }

//         // Find the question by questionId and populate its answers
//         const question = await Question.findById(questionId).populate('answers');
//         if (!question) {
//             return res.status(404).json({ message: 'Question not found' });
//         }

//         // Find the correct answer in the Answer model associated with the questionId
//         const correctAnswerEntry = question.answers.find(ans => ans.isCorrect);
//         if (!correctAnswerEntry) {
//             return res.status(404).json({ message: 'No correct answer found for this question' });
//         }

//         // Ensure userAnswer is provided
//         if (!userAnswer) {
//             return res.status(400).json({ message: 'User answer is missing' });
//         }

//         // Compare user's answer with the correct answer in the Answer model (case-insensitive and trimmed)
//         const isCorrect = correctAnswerEntry.answerText.trim().toLowerCase() === userAnswer.trim().toLowerCase();

//         // Save the user's answer submission in the Answer model
//         const newAnswerSubmission = new Answer({
//             userId,
//             questionId,
//             answerText: userAnswer,
//             isCorrect
//         });
//         await newAnswerSubmission.save();

//         // Return the result of the answer
//         res.status(200).json({
//             message: 'Answer submitted successfully',
//             correctAnswer: correctAnswerEntry.answerText,
//             userAnswer,
//             correct: isCorrect
//         });

//     } catch (error) {
//         console.error('Error submitting answer:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };
exports.submitTypedAnswer = async (req, res) => {
    try {
        const { userAnswer } = req.body;  // Single answer submitted as a string
        const { userId, questionId } = req.params;  // User ID and questionId from the params

        // Validate input
        if (!userId || !questionId || typeof userAnswer !== 'string') {
            return res.status(400).json({ message: 'User ID, question ID, and answer are required' });
        }

        // Find the question by questionId and populate its answers
        const question = await Question.findById(questionId).populate('answers');
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Find the correct answer in the Answer model associated with the questionId
        const correctAnswerEntry = question.answers.find(ans => ans.isCorrect);
        if (!correctAnswerEntry) {
            return res.status(404).json({ message: 'No correct answer found for this question' });
        }

        // Ensure userAnswer is provided
        if (!userAnswer) {
            return res.status(400).json({ message: 'User answer is missing' });
        }

        // Compare user's answer with the correct answer in the Answer model (case-insensitive and trimmed)
        const isCorrect = correctAnswerEntry.answerText.trim().toLowerCase() === userAnswer.trim().toLowerCase();

        // Save the user's answer submission in the Answer model
        const newAnswerSubmission = new Answer({
            userId,
            questionId,
            answerText: userAnswer,
            isCorrect
        });
        await newAnswerSubmission.save();

        // Return the result of the answer
        res.status(200).json({
            message: 'Answer submitted successfully',
            correctAnswer: correctAnswerEntry.answerText,
            userAnswer,
            correct: isCorrect
        });

    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

    
    
    
    
    
// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // Retrieve all users from the database

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        return res.status(200).json({ users });
    } catch (error) {
        console.error('Error retrieving users:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// Delete All Users
exports.deleteAllUsers = async (req, res) => {
    try {
        const result = await User.deleteMany(); // Delete all users from the database

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No users to delete' });
        }

        return res.status(200).json({ message: `${result.deletedCount} users deleted` });
    } catch (error) {
        console.error('Error deleting users:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.deleteFlashcard = async (req, res) => {
    try {
        const { userId, questionId } = req.params;

        // Validate input
        if (!userId || !questionId) {
            logger.warn('Delete flashcard failed: Missing user ID or question ID', { userId, questionId });
            return res.status(400).json({ message: 'User ID and Question ID are required' });
        }

        // Log the IDs being used for debugging
        logger.info('Attempting to delete flashcard', { userId, questionId });

        // Convert to ObjectId using the 'new' keyword to avoid casting errors
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const questionObjectId = new mongoose.Types.ObjectId(questionId);

        // Find the question created by the user
        const question = await Question.findOne({ _id: questionObjectId, createdBy: userObjectId });
        logger.info('Query result:', { question });
        if (!question) {
            logger.warn('Delete flashcard failed: Question not found or not owned by the user', { userId, questionId });
            return res.status(404).json({ message: 'Question not found or not owned by the user' });
        }

        // Delete all answers associated with the question
        await Answer.deleteMany({ questionId: question._id });

        // Use deleteOne to remove the question
        await Question.deleteOne({ _id: question._id });

        logger.info('Flashcard deleted successfully', { userId, questionId });
        return res.status(200).json({ message: 'Flashcard deleted successfully' });

    } catch (error) {
        logger.error('Error deleting flashcard', { error: error.message, stack: error.stack });
        return res.status(500).json({ message: 'Server error' });
    }
};



exports.updateFlashcard = async (req, res) => {
    try {
        const { userId, questionId } = req.params; // UserId and questionId from params
        const { questionText, answerText } = req.body;

        // Validate input
        if (!userId || !questionId || (!questionText && !answerText)) {
            logger.warn('Update flashcard failed: Missing required fields', { userId, questionId, questionText, answerText });
            return res.status(400).json({ message: 'User ID, question ID, and at least one of question text or answer text is required' });
        }

        // Find the question created by the user
        const question = await Question.findOne({ _id: questionId, createdBy: userId });
        if (!question) {
            logger.warn('Update flashcard failed: Question not found', { userId, questionId });
            return res.status(404).json({ message: 'Question not found or not owned by the user' });
        }

        // Update question text if provided
        if (questionText) question.question = questionText;
        
        // Update the associated answer if provided
        if (answerText) {
            const answer = await Answer.findOne({ questionId });
            if (answer) {
                answer.answerText = answerText;
                await answer.save();
            } else {
                logger.warn('Update flashcard failed: Answer not found for question', { questionId });
                return res.status(404).json({ message: 'Answer not found for the question' });
            }
        }

        // Save the updated question
        await question.save();

        logger.info('Flashcard updated successfully', { userId, questionId });
        return res.status(200).json({ message: 'Flashcard updated successfully', question, answerText });

    } catch (error) {
        logger.error('Error updating flashcard', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};
