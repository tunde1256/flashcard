const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../model/admin');
const Question = require('../model/question');
const Answer = require('../model/Answer');
const logger = require('../logger'); // Adjust the path as necessary
const Notification = require('../model/notification');
const User = require('../model/users');
const mongoose = require('mongoose');

// Create a new admin
exports.createAdmin = async (req, res) => {
    try {
        const { username, email, password, role = 'admin', isActive = true, isLocked = false, name } = req.body;

        // Validate input
        if (!username || !email || !password || !name) {
            logger.warn('Validation failed: Missing required fields', { username, email, name });
            return res.status(400).json({ message: 'Username, email, password, and name are required' });
        }

        // Check if username or email already exists
        const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
        if (existingAdmin) {
            logger.warn('Duplicate entry found', { existingAdmin });
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const newAdmin = new Admin({
            username,
            email,
            password: hashedPassword,
            role,
            isActive,
            isLocked,
            createdAt: new Date(),
            name
        });

        // Save the admin
        const savedAdmin = await newAdmin.save();

        logger.info('Admin created successfully', { admin: savedAdmin });

        return res.status(201).json({
            message: 'Admin created successfully',
            data: savedAdmin
        });

    } catch (error) {
        logger.error('Error creating admin', { error });

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Duplicate key error',
                error: error.message
            });
        }

        return res.status(500).json({ message: 'Server error', error });
    }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Default values: page 1 and 10 items per page

        // Validate input
        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: 'Page and limit must be greater than 0' });
        }

        // Calculate total number of admins
        const totalAdmins = await Admin.countDocuments();

        // Find admins with pagination
        const admins = await Admin.find()
            .skip((page - 1) * limit) // Skip admins for previous pages
            .limit(parseInt(limit)); // Limit the number of admins returned per page

        if (!admins.length) {
            logger.info('No admins found');
            return res.status(404).json({ message: 'No admins found' });
        }

        logger.info('All admins retrieved successfully', { admins });

        // Return paginated data
        return res.status(200).json({
            message: 'All admins retrieved successfully',
            data: admins,
            pagination: {
                totalItems: totalAdmins,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalAdmins / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error('Error retrieving admins', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};


// Get an admin by ID
exports.getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.adminId);

        if (!admin) {
            logger.info('Admin not found', { adminId: req.params.adminId });
            return res.status(404).json({ message: 'Admin not found' });
        }

        logger.info('Admin retrieved successfully', { admin });

        return res.status(200).json({
            message: 'Admin retrieved successfully',
            data: admin
        });
    } catch (error) {
        logger.error('Error retrieving admin', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update an admin
exports.updateAdmin = async (req, res) => {
    try {
        const { username, password, role, isActive, isLocked } = req.body;

        if (!username || !role) {
            return res.status(400).json({ message: 'Username and role are required' });
        }

        let updateData = { username, role, isActive, isLocked };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateData.password = hashedPassword;
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(req.params.adminId, updateData, { new: true });

        if (!updatedAdmin) {
            logger.info('Admin not found for update', { adminId: req.params.adminId });
            return res.status(404).json({ message: 'Admin not found' });
        }

        logger.info('Admin updated successfully', { admin: updatedAdmin });

        return res.status(200).json({
            message: 'Admin updated successfully',
            data: updatedAdmin
        });
    } catch (error) {
        logger.error('Error updating admin', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

// Delete an admin
exports.deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.adminId);

        if (!admin) {
            logger.info('Admin not found for deletion', { adminId: req.params.adminId });
            return res.status(404).json({ message: 'Admin not found' });
        }

        logger.info('Admin deleted successfully', { admin });

        return res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        logger.error('Error deleting admin', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

// Admin login
exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const admin = await Admin.findOne({ username });

        if (!admin) {
            logger.info('Admin not found for login', { username });
            return res.status(404).json({ message: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            logger.warn('Invalid credentials for login', { username });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        logger.info('Admin logged in successfully', { username });

        return res.status(200).json({
            message: 'Admin logged in successfully',
            token
        });
    } catch (error) {
        logger.error('Error logging in admin', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};


exports.createQuestionAndAnswers = async (req, res) => {
    try {
        const { title, description, questionText, answersText, userId } = req.body;

        // Validate input
        if (!title || !description || !questionText || !answersText || !answersText.length || !userId) {
            logger.warn('Validation failed: Missing required fields', { title, description, questionText, answersText, userId });
            return res.status(400).json({ message: 'Title, description, question text, answers, and userId are required' });
        }

        // Find the user (either Admin or regular User)
        const user = await User.findById(userId); // Use User model
        if (!user) {
            logger.info('User not found for question creation', { userId });
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new question
        const newQuestion = new Question({
            title,
            description,
            question: questionText,
            createdBy: userId // Reference the user who created the question
        });
        const savedQuestion = await newQuestion.save();

        // Create the answers for the question
        const createdAnswers = await Answer.create(
            answersText.map(answer => ({
                questionId: savedQuestion._id, // Link answer to the question
                userId, // Reference the user who created the answer
                answer // Answer text
            }))
        );

        // Include user details in the response
        const userDetails = {
            name: user.name,
            role: user.role
        };

        logger.info('Question and answers created successfully', { question: savedQuestion, answers: createdAnswers });

        // Return success response
        return res.status(201).json({
            message: 'Question and answers created successfully',
            data: {
                question: {
                    ...savedQuestion.toObject(),
                    createdByDetails: userDetails // Include user details
                },
                answers: createdAnswers
            }
        });

    } catch (error) {
        logger.error('Error creating question and answers', { error });
        return res.status(500).json({ message: 'Server error', error });
    }
};


// Get all questions and their answers
exports.getAllQuestionsAndAnswers = async (req, res) => {
    try {
        // Log route details to debug
        logger.info('Route accessed', { query: req.query, params: req.params });

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of questions
        const totalQuestions = await Question.countDocuments();

        // Find all questions with pagination
        const questions = await Question.find()
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'username email');

        // If no questions are found, return a 404
        if (!questions || questions.length === 0) {
            return res.status(404).json({
                message: 'No questions found'
            });
        }

        const questionIds = questions.map(q => q._id);
        logger.info('Valid question IDs for answers query', { questionIds }); // Log question IDs

        // Find all answers related to the paginated questions
        const answers = await Answer.find({ questionId: { $in: questionIds } })
            .populate('createdBy', 'username email');

        // Combine questions with their answers
        const questionsWithAnswers = questions.map(question => ({
            ...question.toObject(),
            answers: answers.filter(answer => answer.questionId.equals(question._id))
        }));

        logger.info('Questions and answers retrieved successfully', { questionsWithAnswers });

        return res.status(200).json({
            message: 'Questions and answers retrieved successfully',
            data: questionsWithAnswers,
            pagination: {
                page,
                limit,
                total: totalQuestions,
                totalPages: Math.ceil(totalQuestions / limit)
            }
        });
    } catch (error) {
        logger.error('Error retrieving questions and answers', { error });
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a question and its answers by ID
exports.getQuestionAndAnswersById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId).populate('createdBy', 'username email');
        const answers = await Answer.find({ questionId: req.params.questionId }).populate('createdBy', 'username email');

        if (!question) {
            logger.info('Question not found', { questionId: req.params.questionId });
            return res.status(404).json({ message: 'Question not found' });
        }

        logger.info('Question and answers retrieved successfully', { question, answers });

        return res.status(200).json({
            message: 'Question and answers retrieved successfully',
            data: {
                question: question.toObject(),
                answers: answers
            }
        });
    } catch (error) {
        logger.error('Error retrieving question and answers', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update a question and its answers
exports.updateQuestionAndAnswers = async (req, res) => {
    try {
        let question = await Question.findById(req.params.questionId);

        if (!question) {
            logger.info('Question not found for update', { questionId: req.params.questionId });
            return res.status(404).json({ message: 'Question not found' });
        }

        question.title = req.body.title || question.title;
        question.description = req.body.description || question.description;
        question = await question.save();

        const updatedAnswers = req.body.answers || [];
        await Promise.all(
            updatedAnswers.map(answer => Answer.findByIdAndUpdate(answer._id, { content: answer.content }, { new: true }))
        );

        logger.info('Question and answers updated successfully', { question, answers: updatedAnswers });

        return res.status(200).json({
            message: 'Question and answers updated successfully',
            data: {
                question: question.toObject(),
                answers: updatedAnswers
            }
        });
    } catch (error) {
        logger.error('Error updating question and answers', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

// Delete a question and its answers
exports.deleteQuestionAndAnswers = async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId);

        if (!question) {
            logger.info('Question not found for deletion', { questionId: req.params.questionId });
            return res.status(404).json({ message: 'Question not found' });
        }

        await question.deleteOne();
        
        // Log questionId for debugging purposes
        logger.info('Deleting answers associated with questionId', { questionId: req.params.questionId });
        
        const result = await Answer.deleteMany({ questionId: req.params.questionId });

        if (result.deletedCount === 0) {
            logger.warn('No answers found for deletion', { questionId: req.params.questionId });
        } else {
            logger.info('Answers deleted successfully', { questionId: req.params.questionId, deletedCount: result.deletedCount });
        }

        return res.status(200).json({ message: 'Question and answers deleted successfully' });
    } catch (error) {
        logger.error('Error deleting question and answers', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};


// Get all answers for a specific question
exports.getAllAnswersForQuestion = async (req, res) => {
    try {
        const answers = await Answer.find({ questionId: req.params.questionId }).populate('createdBy', 'username email');

        if (!answers.length) {
            logger.info('No answers found for question', { questionId: req.params.questionId });
            return res.status(404).json({ message: 'No answers found for this question' });
        }

        logger.info('All answers retrieved successfully', { answers });

        return res.status(200).json({
            message: 'All answers retrieved successfully',
            data: answers
        });
    } catch (error) {
        logger.error('Error retrieving answers for question', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get an answer by ID for a specific question
exports.getAnswerByIdForQuestion = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.answerId).populate('createdBy', 'username email');

        if (!answer) {
            logger.info('Answer not found for question', { answerId: req.params.answerId });
            return res.status(404).json({ message: 'Answer not found for this question' });
        }

        logger.info('Answer retrieved successfully', { answer });

        return res.status(200).json({
            message: 'Answer retrieved successfully',
            data: answer
        });
    } catch (error) {
        logger.error('Error retrieving answer for question', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

// Create a new answer for a specific question
exports.createAnswerForQuestion = async (req, res) => {
    try {
        const { answerText, createdBy } = req.body;  // Extract answerText and createdBy from the request body
        const { questionId } = req.params;

        // Check if the question exists
        const question = await Question.findById(questionId);
        if (!question) {
            logger.info('Question not found for answer creation', { questionId });
            return res.status(404).json({ message: 'Question not found' });
        }

        // Create the new answer
        const newAnswer = new Answer({
            answerText,
            questionId,
            createdBy  // Ensure the createdBy field is filled
        });

        // Save the new answer to the database
        await newAnswer.save();

        logger.info('Answer created successfully', { questionId, answerId: newAnswer._id });
        return res.status(201).json({ message: 'Answer created successfully', answer: newAnswer });
    } catch (error) {
        // Log the error details for debugging
        logger.error('Error creating answer for question', { error: error.message, stack: error.stack });
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Update an answer for a specific question
exports.updateAnswerForQuestion = async (req, res) => {
    try {
        let answer = await Answer.findById(req.params.answerId);

        if (!answer) {
            logger.info('Answer not found for update', { answerId: req.params.answerId });
            return res.status(404).json({ message: 'Answer not found for this question' });
        }

        answer.content = req.body.content || answer.content;
        answer = await answer.save();

        logger.info('Answer updated successfully', { answer });

        return res.status(200).json({
            message: 'Answer updated successfully',
            data: answer
        });
    } catch (error) {
        logger.error('Error updating answer for question', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};

// Delete an answer for a specific question
exports.deleteAnswerForQuestion = async (req, res) => {
    try {
        const { questionId, answerId } = req.params;

        // Find and remove the answer
        const result = await Answer.deleteOne({ _id: answerId, questionId });
        if (result.deletedCount === 0) {
            logger.info('Answer not found for deletion', { answerId, questionId });
            return res.status(404).json({ message: 'Answer not found' });
        }

        logger.info('Answer deleted successfully', { answerId });

        return res.status(200).json({ message: 'Answer deleted successfully' });

    } catch (error) {
        logger.error('Error deleting answer for question', { error });
        return res.status(500).json({ message: 'Server error', error });
    }
};
exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin by id
        const admin = await Admin.findById({email});
        if (!admin) {
            logger.warn('Reset password attempt failed: Admin not found', { id });
            return res.status(404).json({ message: 'Admin not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const updatedAdmin = await Admin.findByIdAndUpdate(
            id, 
            { password: hashedPassword }, 
            { new: true }
        );

        if (!updatedAdmin) {
            logger.warn('Reset password attempt failed: Admin not found', { id });
            return res.status(404).json({ message: 'Admin not found' });
        }

        logger.info('Password reset successful', { id });
        res.json({ message: 'Password reset successful' });

    }
    catch (e) {
        logger.error('Error resetting password:', e);
        res.status(500).json({ message: e.message });
    }
};
exports.broadcastInactiveUsers = async () => {
    try {
        // Calculate the date and time from two days ago
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        console.log('Calculating inactive users before:', twoDaysAgo);

        // Find inactive users
        const inactiveUsers = await User.find({ lastLogin: { $lt: twoDaysAgo } });
        console.log('Inactive users found:', inactiveUsers);

        if (inactiveUsers.length === 0) {
            console.log('No inactive users found for broadcast');
            return; // Exit if no inactive users
        }

        // Send notifications to each inactive user
        for (const user of inactiveUsers) {
            console.log(`Sending notification to user ${user._id}`);
            const notification = new Notification({
                message: 'We miss you! Please log back into the app.',
                userId: user._id
            });
            await notification.save(); // Ensure each notification is saved before proceeding
        }

        console.log(`Broadcast sent to ${inactiveUsers.length} inactive users`);
    } catch (error) {
        console.error('Error broadcasting to inactive users', error);
    }
};



exports.getInactiveUsers = async (req, res) => {
    try {
        // Extract userId from URL parameters
        const { userId } = req.params;

        // Log the incoming request
        console.log('Request received for getInactiveUsers with userId:', userId);

        // Validate the userId (optional, depending on your requirements)
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Calculate the date two days ago
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        console.log('Calculating inactive users before:', twoDaysAgo);

        // Find inactive users based on lastLogin date and userId
        const inactiveUsers = await User.find({
            lastLogin: { $lt: twoDaysAgo },
            _id: userId
        }).exec();

        // Log the result of the query
        console.log('Inactive users found:', inactiveUsers);

        if (inactiveUsers.length === 0) {
            return res.status(200).json({ message: 'No inactive users found' });
        }

        res.status(200).json({
            message: 'Inactive users retrieved successfully',
            inactiveUsers
        });
    } catch (error) {
        // Log the full error object
        console.error('Error retrieving inactive users:', error);
        
        // Check if the error has more detailed information
        if (error instanceof mongoose.Error.CastError) {
            console.error('CastError details:', error.value, error.kind);
        }
        
        res.status(500).json({ error: 'Internal server error' });
    }
};



exports.markNotificationAsRead = async (req, res) => {
    const { notificationId } = req.params;

    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();

        return res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        logger.error('Error marking notification as read', { error });
        return res.status(500).json({ message: 'Server error' });
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // Check if the admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            logger.warn('Forgot password attempt failed: Admin not found', { email });
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the admin's password
        const updatedAdmin = await Admin.findByIdAndUpdate(
            admin._id, 
            { password: hashedPassword }, 
            { new: true }
        );

        if (!updatedAdmin) {
            logger.warn('Forgot password attempt failed: Admin not found during update', { email });
            return res.status(404).json({ message: 'Admin not found during update' });
        }

        logger.info('Password reset successful', { email });
        res.json({ message: 'Password reset successful' });
    } catch (e) {
        logger.error('Error during password reset:', e);
        res.status(500).json({ message: e.message });
    }
};

exports.getInactiveUsers = async (req, res) => {
    try {
        console.log('Received request for inactive users');
        
        const thirtyMinutesAgo = new Date();
        thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

        console.log('Calculating inactive users before:', thirtyMinutesAgo);

        const inactiveUsers = await User.find({ lastLogin: { $lt: thirtyMinutesAgo } });

        console.log('Inactive users found:', inactiveUsers);

        if (inactiveUsers.length === 0) {
            return res.status(200).json({ message: 'No inactive users found' });
        }

        res.status(200).json({
            message: 'Inactive users retrieved successfully',
            inactiveUsers
        });
    } catch (error) {
        console.error('Error retrieving inactive users', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





exports.updateLastLogin = async (req, res) => {
    try {
        // Extract userId from URL parameters
        const { userId } = req.params;

        // Log the incoming request
        console.log('Request received to update last login for userId:', userId);

        // Validate the userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Update lastLogin for the user
        const result = await User.findByIdAndUpdate(
            userId,
            { lastLogin: new Date() },
            { new: true } // Return the updated document
        ).exec();

        // Check if user was found and updated
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Last login updated successfully',
            user: result
        });
    } catch (error) {
        // Log the full error object
        console.error('Error updating last login for user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
