const express = require("express");
const router = express.Router();
const userController = require("../controller/user");

// User routes
router.post('/register', userController.createUser); // User registration

router.post("/login", userController.loginUser); // User login
router.get("/users", userController.getAllUsers); // Get all users with pagination
router.put("/users/:userId", userController.updateUser); // Update user details
router.delete("/users/:userId", userController.deleteAllUsers); // Delete user

// Question and Answer routes
router.post("/ask-question", userController.askQuestion); // Ask a question
router.put("/update-answer", userController.updateAnswer); // Update an answer
router.delete("/delete-answer", userController.deleteAnswer); // Delete an answer
router.post("/:userId/create-question-answer", userController.createQuestionAndAnswer);
router.post("/createflashcard", userController.createQuestionAndAnswer2); // Create question and answer together
router.get("/questions/:questionId", userController.getQuestionAndAnswers); // Get all answers for a question with pagination
router.get("/answers", userController.getAllAnswers); // Get all answers for
router.post("/forgot-Password", userController.forgotPassword); // Forgot password)
router.post("/reset-password", userController.resetPassword); // Reset password using token
router.get("/category/:category",userController.getAllQuestionsAndAnswersByCategory
); //
 router.get("/categories/:userId", userController.getAllCategories); // Search for questions by title, description, or answer text
router.get("/quiz-question/:userId/:category", userController.getQuizQuestions);
router.post("/quiz-answer/:userId/:questionId", userController.submitTypedAnswer);

router.get("/QA/:userId/:category", userController.getALLQA);
router.get("/category1/:categoryName", userController.getQuestionsAndAnswersFromCategory2)

router.delete('/flashcard/:userId/:questionId',userController.deleteFlashcard)
router.put('/flashcard/:userId/:questionId',userController.updateFlashcard)
/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a user with a username, email, and password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "user123"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "Password123!"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Missing required fields or invalid input
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Log in a user
 *     description: Log in using email and password. Returns a token on success.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "Password123!"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /user/users:
 *   get:
 *     summary: Get all users with pagination
 *     description: Retrieves a paginated list of all users.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: A list of users
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/users/{userId}:
 *   put:
 *     summary: Update a user's details
 *     description: Updates the details of a user by their ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newUser123"
 *               email:
 *                 type: string
 *                 example: "newemail@example.com"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by their ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user/ask-question:
 *   post:
 *     summary: Ask a new question
 *     description: Allows a user to ask a new question with the necessary details, saving it in the database and returning a matched answer if available.
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - questionText
 *               - title
 *               - description
 *               - createdBy
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user asking the question.
 *                 example: "64d28a6a784c0a7b090cbd4c"
 *               questionText:
 *                 type: string
 *                 description: The text of the question being asked.
 *                 example: "What is the capital of France?"
 *               title:
 *                 type: string
 *                 description: The title of the question.
 *                 example: "Geography Question"
 *               description:
 *                 type: string
 *                 description: A detailed description of the question.
 *                 example: "I am curious to know the capital city of France."
 *               createdBy:
 *                 type: string
 *                 description: The ID of the user who created the question.
 *                 example: "64d28a6a784c0a7b090cbd4c"
 *     responses:
 *       200:
 *         description: Question asked successfully with a matched answer (if available).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Question asked successfully"
 *                 question:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "64d28a6a784c0a7b090cbd4c"
 *                     question:
 *                       type: string
 *                       example: "What is the capital of France?"
 *                     title:
 *                       type: string
 *                       example: "Geography Question"
 *                     description:
 *                       type: string
 *                       example: "I am curious to know the capital city of France."
 *                     createdBy:
 *                       type: string
 *                       example: "64d28a6a784c0a7b090cbd4c"
 *                     _id:
 *                       type: string
 *                       example: "64d28a6a784c0a7b090cbd5d"
 *                 answer:
 *                   type: string
 *                   example: "No matching answer found"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All fields are required: userId, questionText, title, description, and createdBy"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

/**
 * @swagger
 * /user/answer-question:
 *   post:
 *     summary: Answer a question
 *     description: Allows a user to answer a question.
 *     tags: [Answers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64d28a6a784c0a7b090cbd4c"
 *               questionId:
 *                 type: string
 *                 example: "64d28a6a784c0a7b090cbd4f"
 *               answerText:
 *                 type: string
 *                 example: "The capital of France is Paris."
 *               createdBy:
 *                 type: string
 *                 example: "64d28a6a784c0a7b090cbd4c"
 *     responses:
 *       200:
 *         description: Answer saved successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: User or question not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/update-answer:
 *   put:
 *     summary: Update an answer
 *     description: Updates an existing answer.
 *     tags: [Answers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answerId:
 *                 type: string
 *                 example: "64d28a6a784c0a7b090cbd51"
 *               answerText:
 *                 type: string
 *                 example: "The updated capital is Paris."
 *     responses:
 *       200:
 *         description: Answer updated successfully
 *       404:
 *         description: Answer not found
 */

/**
 * @swagger
 * /user/delete-answer:
 *   delete:
 *     summary: Delete an answer
 *     description: Deletes an answer by its ID.
 *     tags: [Answers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answerId:
 *                 type: string
 *                 example: "64d28a6a784c0a7b090cbd51"
 *     responses:
 *       200:
 *         description: Answer deleted successfully
 *       404:
 *         description: Answer not found
 */

/**
 * @swagger
 * /user/answers:
 *   get:
 *     summary: Get all answers
 *     description: Retrieves all answers from the database.
 *     tags: [Answers]
 *     responses:
 *       200:
 *         description: A list of all answers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "64d28a6a784c0a7b090cbd5d"
 *                   userId:
 *                     type: string
 *                     example: "64d28a6a784c0a7b090cbd4c"
 *                   questionId:
 *                     type: string
 *                     example: "64d28a6a784c0a7b090cbd4f"
 *                   answerText:
 *                     type: string
 *                     example: "The capital of Spain is Madrid."
 *                   createdBy:
 *                     type: string
 *                     example: "64d28a6a784c0a7b090cbd4c"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-09-09T12:00:00Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-09-09T12:00:00Z"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

module.exports = router;
