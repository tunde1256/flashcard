const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    questions: [
        {
            questionText: { type: String},
            answerText: { type: String},
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, // Optional: for tracking the Question model
            answerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }, // Optional: for tracking the Answer model
            createdAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
