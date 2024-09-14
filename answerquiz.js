
const AnswerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
});

const Answer = mongoose.model('Answer', AnswerSchema);