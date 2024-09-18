const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    categoryName: {
        type: String,
        required: true
    },
    questions: [
        {
            questionText: String,
            answerText: String
        }
    ]
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
