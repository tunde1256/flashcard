// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const answerSchema = new Schema({
//     questionId: {
//         type: Schema.Types.ObjectId, 
//         ref: 'Question', 
//         required: true
//     },
//     userId: {
//         type: Schema.Types.ObjectId, 
//         ref: 'User', 
//         required: true
//     },
//     answer: {
//         type: String,
//         required: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// const Answer = mongoose.model('Answer', answerSchema);
// module.exports = Answer;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
    answerText: {
        type: String,
        required: true
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Answer = mongoose.model('Answer', answerSchema);
module.exports = Answer;
