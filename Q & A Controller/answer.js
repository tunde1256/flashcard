const Answer = require('../models/answer'); // Adjust the path as needed
const Question = require('../models/question'); // Adjust the path as needed

// Create an answer for a question
exports.createAnswer = async (req, res) => {
    try {
        const { questionId, userId, answerText } = req.body;

        // Validate input
        if (!questionId || !userId || !answerText) {
            return res.status(400).json({ message: 'Question ID, user ID, and answer text are required' });
        }

        // Check if the question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Create and save the new answer
        const newAnswer = new Answer({
            questionId,
            userId,
            answer: answerText
        });
        await newAnswer.save();

        return res.status(201).json({ message: 'Answer created successfully', answer: newAnswer });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get answers for a specific question
exports.getAnswersForQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;

        // Validate input
        if (!questionId) {
            return res.status(400).json({ message: 'Question ID is required' });
        }

        // Find answers for the specified question
        const answers = await Answer.find({ questionId }).populate('userId', 'username email'); // Adjust fields as needed

        return res.status(200).json({ answers });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get all answers for a user
exports.getAllAnswersForUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate input
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Find all answers by the specified user
        const answers = await Answer.find({ userId }).populate('questionId', 'question'); // Adjust fields as needed

        return res.status(200).json({ answers });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
