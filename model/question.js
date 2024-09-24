const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    question: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
    createdAt: Date
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
