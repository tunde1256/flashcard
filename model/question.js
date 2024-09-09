// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const questionSchema = new Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     description: {
//         type: String,
//         required: true,
//     },
//     question: {
//         type: String,
//         required: true,
//     },
//     createdBy: {
//         type: Schema.Types.ObjectId, 
//         ref: 'User', 
//         required: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// const Question = mongoose.model('Question', questionSchema);
// module.exports = Question;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    question: {
        type: String,
        required: true,
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

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
