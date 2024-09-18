const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
    answerText: { type: String, required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true }, // Ensure this is a valid ObjectId
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Referencing User
    isCorrect: { type: Boolean, default: true }, // Indicates if this is the correct answer
    createdAt: { type: Date, default: Date.now }
});

const Answer = mongoose.model('Answer', answerSchema);
module.exports = Answer;
