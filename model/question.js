const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    title: {
        type: String,
       
    },
    description: {
        type: String,
      
    },
    question: {
        type: String,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
     
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,  // You can adjust this if you want to reference another collection (e.g., categories)
        required: true
    }
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
