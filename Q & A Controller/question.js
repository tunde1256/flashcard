const Question = require("../model/question");

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find({});
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const newQuestion = new Question({
      userId: req.body.userId,
      title: req.body.title,
      description: req.body.description,
    });
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a question
exports.updateQuestion = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedQuestion) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(deletedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add answer to a question
exports.addAnswer = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { $push: { answers: req.body } },
      { new: true }
    );
    if (!updatedQuestion) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get answers for a question
exports.getAnswers = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(question.answers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an answer from a question
exports.deleteAnswer = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { $pull: { answers: { _id: req.params.answerId } } },
      { new: true }
    );
    if (!updatedQuestion) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upvote an answer
exports.upvoteAnswer = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { "answers.$[answer].votes": 1 } },
      { arrayFilters: [{ "_id": req.params.answerId }] }
    );
    if (!updatedQuestion) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Downvote an answer
exports.downvoteAnswer = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { "answers.$[answer].votes": -1 } },
      { arrayFilters: [{ "_id": req.params.answerId }] }
    );
    if (!updatedQuestion) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get questions with the most upvotes
exports.getTopQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ "answers.votes": -1 })
      .limit(10);
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get questions with the most answers
exports.getMostAnsweredQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ answers: -1 })
      .limit(10);
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get questions with the most views
exports.getMostViewedQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ views: -1 })
      .limit(10);
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get questions with the most recent answers
exports.getRecentlyAnsweredQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ "answers.createdAt": -1 })
      .limit(10);
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get questions with the most recent views
exports.getRecentlyViewedQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get questions with the most recent updates
exports.getRecentlyUpdatedQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ updatedAt: -1 })
      .limit(10);
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get questions with the most recent comments
exports.getRecentlyCommentedQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ "comments.createdAt": -1 })
      .limit(10);
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get questions with the most recent votes
exports.getRecentlyVotedQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ "votes.createdAt": -1 })
      .limit(10);
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}


