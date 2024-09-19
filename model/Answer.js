const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new mongoose.Schema({
    answerText: String,
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    createdBy: mongoose.Schema.Types.ObjectId,
    isCorrect: { type: Boolean, default: true }, // Add this line
    createdAt: { type: Date, default: Date.now }
});


const Answer = mongoose.model('Answer', answerSchema);
module.exports = Answer;
