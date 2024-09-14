const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    answers: [{  // This field will store references to Answer documents
        type: Schema.Types.ObjectId,
        ref: 'Answer'
    }]
});

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
module.exports = Question;
