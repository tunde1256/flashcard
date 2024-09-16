 const User = require('../model/users'); // Adjust the path as needed
 const Question = require('../model/question'); // Adjust the path as needed
const Answer = require('../model/Answer'); // Adjust the path as needed
 const bcrypt = require('bcrypt');
 const jwt = require('jsonwebtoken');
const logger = require('../logger'); // Adjust the path as necessary
 const { broadcastInactiveUsers } = require('../controller/admin'); 

// exports.loginUser = async (req, res) => {
//     try {
//         const { email, password, question } = req.body;

//         // Find the user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             logger.warn('Login failed: User not found', { email });
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Compare the provided password with the stored hashed password
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//             logger.warn('Login failed: Invalid credentials', { email });
//             return res.status(401).json({ message: 'Invalid credentials' });
//         }

//         // Update the last login date
//         user.lastLogin = new Date();
//         await user.save();

//         // Generate JWT token
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         // Fetch all questions for the logged-in user
//         const questions = await Question.find({ createdBy: user._id });

//         // Fetch all answers for the logged-in user
//         const answers = await Answer.find({ userId: user._id });

//         // Check if a provided question matches any stored question
//         let matchedAnswer = 'No matching answer found';
//         if (question) {
//             const matchedQuestion = await Question.findOne({
//                 createdBy: user._id,
//                 question: new RegExp(question, 'i') // Case-insensitive match
//             });

//             if (matchedQuestion) {
//                 const answer = await Answer.findOne({
//                     questionId: matchedQuestion._id,
//                     userId: user._id
//                 });
//                 matchedAnswer = answer ? answer.answer : matchedAnswer;
//             }
//         }

//         // Send notifications to inactive users
//         await broadcastInactiveUsers();

//         // Return user details along with their questions and answers
//         logger.info('Login successful', { userId: user._id, token });
//         return res.status(200).json({
//             message: 'Login successful',
//             user: {
//                 id: user._id,
//                 email: user.email,
//                 name: user.username, // Adjust this if needed
//                 token,
//                 lastLogin: user.lastLogin // Include lastLogin in the response
//             },
//             questions,
//             answers, // Include answers in the response
//             matchedAnswer
//         });

//     } catch (error) {
//         logger.error('Error during login', { error });
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

// // User registration
// exports.createUser = async (req, res) => {
//     try {
//         const { username, email, password } = req.body;

//         // Validate input
//         if (!username || !email || !password) {
//             logger.warn('User creation failed: Missing required fields', { username, email });
//             return res.status(400).json({ message: 'Username, email, and password are required' });
//         }

//         // Validate email format
//         const validationEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!validationEmail.test(email)) {
//             logger.warn('User creation failed: Invalid email format', { email });
//             return res.status(400).json({ message: 'Invalid email' });
//         }

//         // Validate password format
//         const validationPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//         if (!validationPassword.test(password)) {
//             logger.warn('User creation failed: Invalid password format', { email });
//             return res.status(400).json({ message: 'Invalid password' });
//         }

//         // Check if the user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             logger.warn('User creation failed: Email already in use', { email });
//             return res.status(409).json({ message: 'Email already in use' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create and save the new user
//         const newUser = new User({
//             username,
//             email,
//             password: hashedPassword
//         });
//         await newUser.save();

//         // Generate and return a JWT token
//         const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         logger.info('User created successfully', { userId: newUser._id });
//         return res.status(201).json({
//             message: 'User created successfully',
//             username: newUser.username,
//             email: newUser.email,
//             token
//         });

//     } catch (error) {
//         logger.error('Error during user creation', { error });
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

// // Ask a question
// /**
//  * Ask a new question
//  */
// exports.askQuestion = async (req, res) => {
//     try {
//         const { userId, questionText, category } = req.body;

//         // Validate input
//         if (!userId || !questionText || !category) {
//             logger.warn('Question asking failed: Missing required fields', { userId });
//             return res.status(400).json({ message: 'All fields are required: userId, questionText, and category' });
//         }

//         // Find the user
//         const user = await User.findById(userId);
//         if (!user) {
//             logger.warn('Question asking failed: User not found', { userId });
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Save the question with category
//         const newQuestion = new Question({
//             userId,
//             question: questionText,
//             category // Include category here
//         });
//         await newQuestion.save();

//         // Find the answer
//         let answerText = 'No matching answer found';
//         const matchedQuestion = await Question.findOne({
//             userId,
//             question: new RegExp(questionText, 'i') // Case-insensitive match
//         });

//         if (matchedQuestion) {
//             const answer = await Answer.findOne({
//                 questionId: matchedQuestion._id,
//                 userId
//             });
//             answerText = answer ? answer.answer : answerText;
//         }

//         logger.info('Question asked successfully', { userId, questionId: newQuestion._id });
//         return res.status(200).json({
//             message: 'Question asked successfully',
//             question: newQuestion,
//             answer: answerText
//         });

//     } catch (error) {
//         logger.error('Error asking question', { error });
//         return res.status(500).json({ message: 'Server error' });
//     }
// };



// exports.answerQuestion = async (req, res) => {
//     try {
//         const { userId, questionId, answerText, category } = req.body;

//         // Validate input
//         if (!userId || !questionId || !answerText || !category) {
//             logger.warn('Answer creation failed: Missing required fields', { userId, questionId });
//             return res.status(400).json({ message: 'User ID, question ID, answer text, and category are required' });
//         }

//         // Find the user
//         const user = await User.findById(userId);
//         if (!user) {
//             logger.warn('Answer creation failed: User not found', { userId });
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Find the question
//         const question = await Question.findById(questionId);
//         if (!question) {
//             logger.warn('Answer creation failed: Question not found', { questionId });
//             return res.status(404).json({ message: 'Question not found' });
//         }

//         // Save the answer with the category
//         const newAnswer = new Answer({
//             userId,
//             questionId,
//             answerText,
//             category // Include category here
//         });
//         await newAnswer.save();

//         logger.info('Answer saved successfully', { userId, questionId, answerId: newAnswer._id });
//         return res.status(200).json({
//             message: 'Answer saved successfully',
//             answer: newAnswer
//         });

//     } catch (error) {
//         logger.error('Error answering question', { error });
//         return res.status(500).json({ message: 'Server error' });
//     }

// }
// // Update an answer
// exports.updateAnswer = async (req, res) => {
//     try {
//         const { userId, questionId, answerId, answerText } = req.body;

//         // Validate input
//         if (!userId || !questionId || !answerId || !answerText) {
//             logger.warn('Answer update failed: Missing required fields', { userId, questionId, answerId });
//             return res.status(400).json({ message: 'User ID, question ID, answer ID, and answer text are required' });
//         }

//         // Find the user
//         const user = await User.findById(userId);
//         if (!user) {
//             logger.warn('Answer update failed: User not found', { userId });
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Find the question
//         const question = await Question.findById(questionId);
//         if (!question) {
//             logger.warn('Answer update failed: Question not found', { questionId });
//             return res.status(404).json({ message: 'Question not found' });
//         }

//         // Update the answer
//         const answer = await Answer.findByIdAndUpdate(answerId, { answer: answerText }, { new: true });
//         if (!answer) {
//             logger.warn('Answer update failed: Answer not found', { answerId });
//             return res.status(404).json({ message: 'Answer not found' });
//         }

//         logger.info('Answer updated successfully', { userId, questionId, answerId });
//         return res.status(200).json({
//             message: 'Answer updated successfully',
//             answer
//         });

//     } catch (error) {
//         logger.error('Error updating answer', { error });
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

// // Delete an answer
// exports.deleteAnswer = async (req, res) => {
//     try {
//         const { userId, answerId } = req.body;

//         // Validate input
//         if (!userId || !answerId) {
//             logger.warn('Answer deletion failed: Missing required fields', { userId, answerId });
//             return res.status(400).json({ message: 'User ID and answer ID are required' });
//         }

//         // Find the user
//         const user = await User.findById(userId);
//         if (!user) {
//             logger.warn('Answer deletion failed: User not found', { userId });
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Find and delete the answer
//         const answer = await Answer.findByIdAndDelete(answerId);
//         if (!answer) {
//             logger.warn('Answer deletion failed: Answer not found', { answerId });
//             return res.status(404).json({ message: 'Answer not found' });
//         }

//         logger.info('Answer deleted successfully', { userId, answerId });
//         return res.status(200).json({
//             message: 'Answer deleted successfully'
//         });

//     } catch (error) {
//         logger.error('Error deleting answer', { error });
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

// // Create a question and answer
// exports.createQuestionAndAnswer = async (req, res) => {
//     try {
//         const { userId, questionText, answerText, category } = req.body;

//         // Validate input
//         if (!userId || !questionText || !answerText || !category) {
//             logger.warn('Question and answer creation failed: Missing required fields', { userId, questionText, answerText, category });
//             return res.status(400).json({ message: 'User ID, question text, answer text, and category are required' });
//         }

//         // Check if the user exists
//         const user = await User.findById(userId);
//         if (!user) {
//             logger.warn('Question and answer creation failed: User not found', { userId });
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Create and save the question
//         const newQuestion = new Question({
//             question: questionText,
//             createdBy: userId,
//             category
//         });
//         await newQuestion.save();

//         // Create and save the answer
//         const newAnswer = new Answer({
//             questionId: newQuestion._id,
//             answerText,
//             createdBy: userId,
//         });
//         await newAnswer.save();

//         // Update the question's answers array to include the new answer
//         newQuestion.answers.push(newAnswer._id);
//         await newQuestion.save(); // Save the question after updating its answers array

//         logger.info('Question and answer created successfully', { userId, questionId: newQuestion._id, answerId: newAnswer._id });
//         return res.status(201).json({
//             message: 'Question and answer created successfully',
//             question: newQuestion,
//             answer: newAnswer
//         });

//     } catch (error) {
//         logger.error('Error creating question and answer', { error });
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

// // POST /api/user/create-question-answer
// exports.createQuestionAndAnswer2 = async (req, res) => {
//     try {
//         const { userId, questionText, answerText, category } = req.body;

//         // Validate input
//         if (!userId || !questionText || !answerText || !category) {
//             logger.warn('Question and answer creation failed: Missing required fields', { userId, questionText, answerText, category });
//             return res.status(400).json({ message: 'User ID, question text, answer text, and category are required' });
//         }

//         // Check if the user exists
//         const user = await User.findById(userId);
//         if (!user) {
//             logger.warn('Question and answer creation failed: User not found', { userId });
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Create and save the question
//         const newQuestion = new Question({
//             question: questionText,
//             createdBy: userId,
//             category
//         });
//         await newQuestion.save();

//         // Create and save the answer
//         const newAnswer = new Answer({
//             questionId: newQuestion._id,
//             answerText,
//             createdBy: userId,
//         });
//         await newAnswer.save();

//         // Update the question's answers array to include the new answer
//         newQuestion.answers.push(newAnswer._id);
//         await newQuestion.save(); // Save the question after updating its answers array

//         logger.info('Question and answer created successfully', { userId, questionId: newQuestion._id, answerId: newAnswer._id });
//         return res.status(201).json({
//             message: 'Question and answer created successfully',
//             question: newQuestion,
//             answer: newAnswer
//         });

//     } catch (error) {
//         logger.error('Error creating question and answer', { error });
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

exports.getALLQA = async (req, res) => {
    try {
        const { userId, category } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Build the query for questions
        const query = { createdBy: userId };
        if (category) query.category = category; // Optionally filter by category

        // Fetch questions and populate answers
        const questions = await Question.find(query)
            .populate({
                path: 'answers',        // Populate answers field
                select: 'answerText',   // Select only the answerText field from the Answer model
            })
            .exec();

        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: 'No questions found' });
        }

        return res.status(200).json({ questions });
    } catch (error) {
        console.error('Error retrieving questions and answers:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// // get category
// exports.getQuestionsAndAnswersByCategory = async (req, res) => {
//     try {
//         const { category, userId } = req.params; // Extract category and userId from the URL parameters

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



// // get all questions and answers by category
// exports.getAllCategories = async (req, res) => {
//     try {
//         const { userId } = req.params; // userId from query parameters

//         if (!userId) {
//             return res.status(400).json({ message: 'User ID is required' });
//         }

//         // Find all questions created by the user and get unique categories
//         const categories = await Question.find({ createdBy: userId }).distinct('category');

//         if (categories.length === 0) {
//             return res.status(404).json({ message: 'No categories found for this user' });
//         }

//         // Fetch all questions and answers for the categories
//         const questions = await Question.find({ createdBy: userId, category: { $in: categories } });
//         const questionIds = questions.map(question => question._id);
//         const answers = await Answer.find({ questionId: { $in: questionIds } });

//         return res.status(200).json({
//             message: 'Questions and answers retrieved successfully',
//             categories,
//             questions,
//             answers
//         });

//     } catch (error) {
//         logger.error('Error fetching questions and answers by user:', error);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };


// exports.resetPassword = async (req, res) => {
//     try {
//         const { email, newPassword, confirmPassword } = req.body;

//         if (!email || !newPassword || !confirmPassword) {
//             return res.status(400).json({ message: 'Email, new password, and confirm password are required' });
//         }

//         if (newPassword !== confirmPassword) {
//             return res.status(400).json({ message: 'Passwords do not match' });
//         }

//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Hash the new password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(newPassword, salt);

//         // Update user's password
//         user.password = hashedPassword;
//         await user.save();

//         logger.info('Password reset successfully', { userId: user._id });
//         return res.status(200).json({ message: 'Password reset successfully' });

//     } catch (error) {
//         logger.error('Error during password reset:', error);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };
// exports.forgotPassword = async (req, res) => {
//     try {
//         const { email, newPassword, confirmPassword } = req.body;

//         // Validate input
//         if (!email || !newPassword || !confirmPassword) {
//             return res.status(400).json({ message: 'Email, new password, and confirm password are required' });
//         }

//         // Check if passwords match
//         if (newPassword !== confirmPassword) {
//             return res.status(400).json({ message: 'Passwords do not match' });
//         }

//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User with this email does not exist' });
//         }

//         // Hash new password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(newPassword, salt);

//         // Update the user's password
//         user.password = hashedPassword;
//         await user.save();

//         logger.info('Password reset successfully for user', { userId: user._id });
//         return res.status(200).json({ message: 'Password has been reset successfully' });

//     } catch (error) {
//         logger.error('Error during password reset', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };


// // get all questions and answers by category
// exports.getAllQuestionsAndAnswersByCategory = async (req, res) => {
//     try {
//         const { category } = req.params;

//         // Validate input
//         if (!category) {
//             logger.warn('Category search failed: Missing category parameter');
//             return res.status(400).json({ message: 'Category is required' });
//         }

//         // Find questions by category
//         const questions = await Question.find({ category });

//         if (questions.length === 0) {
//             return res.status(404).json({ message: 'No questions found for this category' });
//         }

//         // Find answers for the found questions
//         const questionIds = questions.map(question => question._id);
//         const answers = await Answer.find({ questionId: { $in: questionIds } });

//         logger.info('All questions and answers retrieved successfully', { category, questionCount: questions.length, answerCount: answers.length })
//     }catch(e) {
//         logger.error('Error retrieving all questions and answers by category', { error });
//         return res.status(500).json({ message: 'Server error' });
//     }
// }


// // Get all questions and answers for a specific user
// exports.getQuestionAndAnswers = async (req, res) => {
//     try {
//         const { questionId } = req.params;
//         const { page = 1, limit = 10 } = req.query; // Default values: page 1 and 10 items per page

//         // Validate input
//         if (!questionId) {
//             logger.warn('Fetching questions and answers failed: Missing question ID', { questionId });
//             return res.status(400).json({ message: 'Question ID is required' });
//         }

//         // Find the question
//         const question = await Question.findById(questionId);
//         if (!question) {
//             logger.warn('Fetching questions and answers failed: Question not found', { questionId });
//             return res.status(404).json({ message: 'Question not found' });
//         }

//         // Calculate total number of answers for the question
//         const totalAnswers = await Answer.countDocuments({ questionId });

//         // Find all answers related to the question with pagination
//         const answers = await Answer.find({ questionId })
//             .skip((page - 1) * limit) // Skip answers for previous pages
//             .limit(parseInt(limit))   // Limit the number of answers returned per page

//         // Return paginated data
//         logger.info('Fetched questions and answers successfully', { questionId, pagination: { totalItems: totalAnswers, currentPage: parseInt(page), totalPages: Math.ceil(totalAnswers / limit), limit: parseInt(limit) } });
//         return res.status(200).json({
//             question,
//             answers,
//             pagination: {
//                 totalItems: totalAnswers,
//                 currentPage: parseInt(page),
//                 totalPages: Math.ceil(totalAnswers / limit),
//                 limit: parseInt(limit)
//             }
//         });

//     } catch (error) {
//         logger.error('Error fetching questions and answers', { error });
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

// exports.deleteUser = async  (req, res) => {
//     try {
//         const { userId } = req.params;

//         // Validate input
//         if (!userId) {
//             logger.warn('User deletion failed: Missing user ID', { userId });
//             return res.status(400).json({ message: 'User ID is required' });
//         }

//         // Find the user
//         const user = await User.findByIdAndDelete(userId);
//         if (!user) {
//             logger.warn('User deletion failed: User not found', { userId });
//             return res.status(404).json({ message: 'User not found' });
//         }

//         logger.info('User deleted successfully', { userId });
//         return res.status(200).json({
//             message: 'User deleted successfully'
//         });

//     } catch (error) {
//         logger.error('Error deleting user', { error });
//         return res.status(500).json({ message: 'Server error' });
//     }
// };
// exports.updateUser = async(req, res, next) => {
//     try {
//         const { userId } = req.params;
//         const updatedUser = req.body;

//         // Validate input
//         if (!userId) {
//             logger.warn('User update failed: Missing user ID', { userId });
//             return res.status(400).json({ message: 'User ID is required' });
//         }

//         // Find the user
//         const user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });
//         if (!user) {
//             logger.warn('User update failed: User not found', { userId });
//             return res.status(404).json({ message: 'User not found' });
//         }

//         logger.info('User updated successfully', { userId });
//         return res.status(200).json({
//             message: 'User updated successfully',
//             user
//         });

//     } catch (error) {
//         logger.error('Error updating user', { error });
//         return res.status(200).json({message: 'User updated successfully'});
// };
//     }

//     // Get all users
//     exports.getUsers = async (req, res) => {
//         try {
//             const { page = 1, limit = 10 } = req.query; // Default values: page 1 and 10 items per page
    
//             // Calculate total number of users
//             const totalUsers = await User.countDocuments();
    
//             // Find all users with pagination
//             const users = await User.find()
//                 .skip((page - 1) * limit) // Skip users for previous pages
//                 .limit(parseInt(limit));  // Limit the number of users returned per page
    
//             // Return paginated data
//             logger.info('Fetched users successfully', {
//                 pagination: {
//                     totalItems: totalUsers,
//                     currentPage: parseInt(page),
//                     totalPages: Math.ceil(totalUsers / limit),
//                     limit: parseInt(limit)
//                 }
//             });
    
//             return res.status(200).json({
//                 users,
//                 pagination: {
//                     totalItems: totalUsers,
//                     currentPage: parseInt(page),
//                     totalPages: Math.ceil(totalUsers / limit),
//                     limit: parseInt(limit)
//                 }
//             });
    
//         } catch (error) {
//             logger.error('Error fetching users', { error });
//             return res.status(500).json({ message: 'Server error' });
//         }
//     };
//     exports.getAllAnswers = async(req, res)=>{
//         try{
//             const answers = await Answer.find();
//             return res.status(200).json(answers);
//         }
//         catch(error){
//             console.error(error);
//             return res.status(500).json({message: 'Server error'});
//         }
//     }
//     exports.getQuizQuestions = async (req, res) => {
//         try {
//             const { userId, category } = req.params;
    
//             if (!userId) {
//                 return res.status(400).json({ message: 'User ID is required' });
//             }
    
//             // Fetch questions by category
//             const questions = await Question.find({ category }).limit(10); // Adjust limit as needed
    
//             if (questions.length === 0) {
//                 return res.status(404).json({ message: 'No questions available in this category' });
//             }
    
//             res.status(200).json({
//                 message: 'Quiz questions retrieved successfully',
//                 questions
//             });
//         } catch (error) {
//             console.error('Error fetching quiz questions:', error);
//             res.status(500).json({ message: 'Server error' });
//         }
//     };
//     exports.submitTypedAnswers = async (req, res) => {
//         try {
//             const { userId, answers } = req.body;
    
//             if (!userId || !answers || !Array.isArray(answers)) {
//                 return res.status(400).json({ message: 'User ID and answers are required' });
//             }
    
//             let correctCount = 0;
//             const results = [];
    
//             for (const answer of answers) {
//                 const { questionId, userAnswer } = answer;
    
//                 // Find the question
//                 const question = await Question.findById(questionId);
//                 if (!question) {
//                     results.push({ questionId, correct: false, error: 'Question not found' });
//                     continue;
//                 }
    
//                 // Check if the user's answer is correct
//                 const isCorrect = question.correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
    
//                 if (isCorrect) correctCount++;
    
//                 // Save user's answer
//                 const newAnswer = new Answer({
//                     userId,
//                     questionId,
//                     userAnswer,
//                     isCorrect
//                 });
    
//                 await newAnswer.save();
    
//                 results.push({
//                     questionId,
//                     correctAnswer: question.correctAnswer,
//                     userAnswer,
//                     correct: isCorrect
//                 });
//             }
    
//             res.status(200).json({
//                 message: 'Quiz results submitted successfully',
//                 results,
//                 correctCount,
//                 totalQuestions: answers.length
//             });
    
//         } catch (error) {
//             console.error('Error submitting quiz answers:', error);
//             res.status(500).json({ message: 'Server error' });
//         }
//     };
    
