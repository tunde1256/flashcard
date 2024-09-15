const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new mongoose.Schema({
    title: String,
    description: String,
    question: String,
    createdBy: mongoose.Schema.Types.ObjectId,
    category: String,
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }], // Reference to the Answer model
    createdAt: Date
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
