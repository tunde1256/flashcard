const User = require('../model/users'); // Adjust the path as needed
const Question = require('../model/question'); // Adjust the path as needed
const Answer = require('../model/Answer'); // Adjust the path as needed
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../logger'); // Adjust the path as necessary

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

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Fetch all questions for the logged-in user
        const questions = await Question.find({ createdBy: user._id });

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

        // Return user details along with their questions and the matched answer if queried
        logger.info('Login successful', { userId: user._id, token });
        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                name: user.username, // Adjust this if needed
                token
            },
            questions,
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
        const { userId, questionText, title, description, createdBy } = req.body;

        // Validate input
        if (!userId || !questionText || !title || !description || !createdBy) {
            logger.warn('Question asking failed: Missing required fields', { userId });
            return res.status(400).json({ message: 'All fields are required: userId, questionText, title, description, and createdBy' });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('Question asking failed: User not found', { userId });
            return res.status(404).json({ message: 'User not found' });
        }

        // Save the question
        const newQuestion = new Question({
            userId,
            question: questionText,
            title,
            description,
            createdBy
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


// Answer a question
exports.answerQuestion = async (req, res) => {
    try {
        const { userId, questionId, answerText, createdBy } = req.body;

        // Validate input
        if (!userId || !questionId || !answerText || !createdBy) {
            logger.warn('Answer creation failed: Missing required fields', { userId, questionId });
            return res.status(400).json({ message: 'User ID, question ID, answer text, and createdBy are required' });
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

        // Save the answer
        const newAnswer = new Answer({
            userId,
            questionId,
            answerText,
            createdBy  // Ensure this field is included
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
};

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

// Create a question and answer
exports.createQuestionAndAnswer = async (req, res) => {
    try {
        const { userId, questionText, answerText, description, title, createdBy } = req.body;

        // Validate input
        if (!userId || !questionText || !answerText || !description || !title || !createdBy) {
            logger.warn('Question and answer creation failed: Missing required fields', { userId });
            return res.status(400).json({ message: 'User ID, title, description, question text, answer text, and createdBy are required' });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('Question and answer creation failed: User not found', { userId });
            return res.status(404).json({ message: 'User not found' });
        }

        // Create and save the question
        const newQuestion = new Question({
            createdBy,
            title,
            description,
            question: questionText,
        });
        await newQuestion.save();

        // Create and save the answer
        const newAnswer = new Answer({
            questionId: newQuestion._id,
            userId,
            answerText,
            createdBy  // Ensure this field is included
        });
        await newAnswer.save();

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
