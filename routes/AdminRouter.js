const express = require('express');
const router = express.Router();
const AdminRoute = require('../controller/admin');
const { validateCreateAdmin, validateLoginAdmin} = require('../middleware/validation'); // Ensure correct path
const broadCast = require('../controller/admin')
// Admin routes
router.post('/register', validateCreateAdmin, AdminRoute.createAdmin);
router.post('/login', validateLoginAdmin, AdminRoute.loginAdmin);
router.put('/update/:adminId', AdminRoute.updateAdmin);
router.delete('/delete/:adminId', AdminRoute.deleteAdmin);
router.get('/:adminId', AdminRoute.getAdminById);
router.get('/', AdminRoute.getAllAdmins);

// Question and Answer routes
router.post('/createquestions', AdminRoute.createQuestionAndAnswers);
router.get('/questions/questions', AdminRoute.getAllQuestionsAndAnswers);
router.get('/questions/:questionId', AdminRoute.getQuestionAndAnswersById);
router.put('/questions/:questionId', AdminRoute.updateQuestionAndAnswers);
router.delete('/questions/:questionId', AdminRoute.deleteQuestionAndAnswers);
router.post('/questions/:questionId/answers', AdminRoute.createAnswerForQuestion);
router.get('/questions/:questionId/answers', AdminRoute.getAllAnswersForQuestion);
router.get('/questions/:questionId/answers/:answerId', AdminRoute.getAnswerByIdForQuestion);
router.put('/questions/:questionId/answers/:answerId', AdminRoute.updateAnswerForQuestion);
router.delete('/questions/:questionId/answers/:answerId', AdminRoute.deleteAnswerForQuestion);
router.post('/forgotPassword', AdminRoute.forgotPassword);
router.put('/resetPassword/:token', AdminRoute.resetPassword);
router.post('/broadcast', broadCast.broadcastInactiveUsers);
router.put('/markbroadcast', broadCast.markNotificationAsRead)

router.get ('/getInactiveUsers/:Id', AdminRoute.getInactiveUsers)

router.put('/lastLogin/:userId', AdminRoute.updateLastLogin);

/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: Register a new admin
 *     description: Create a new admin with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 example: admin
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               isLocked:
 *                 type: boolean
 *                 example: false
 *               name:
 *                 type: string
 *                 example: John Doe
 *             required:
 *               - username
 *               - email
 *               - password
 *               - name
 *     responses:
 *       '201':
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     isLocked:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     name:
 *                       type: string
 *       '400':
 *         description: Validation error or duplicate entry
 *       '500':
 *         description: Server error
 */
router.post('/register', AdminRoute.createAdmin);

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Login an admin
 *     description: Authenticate an admin with username and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: password123
 *             required:
 *               - username
 *               - password
 *     responses:
 *       '200':
 *         description: Admin logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin logged in successfully
 *                 token:
 *                   type: string
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Invalid credentials
 *       '500':
 *         description: Server error
 */
router.post('/login', AdminRoute.loginAdmin);

/**
 * @swagger
 * /admin/update/{adminId}:
 *   put:
 *     summary: Update an admin
 *     description: Update details of an existing admin by ID.
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         description: The ID of the admin to update
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
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               isLocked:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: Admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     isLocked:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     name:
 *                       type: string
 *       '400':
 *         description: Validation error
 *       '404':
 *         description: Admin not found
 *       '500':
 *         description: Server error
 */
router.put('/update/:adminId', AdminRoute.updateAdmin);

/**
 * @swagger
 * /admin/delete/{adminId}:
 *   delete:
 *     summary: Delete an admin
 *     description: Delete an admin by ID.
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         description: The ID of the admin to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Admin deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin deleted successfully
 *       '404':
 *         description: Admin not found
 *       '500':
 *         description: Server error
 */
router.delete('/delete/:adminId', AdminRoute.deleteAdmin);

/**
 * @swagger
 * /admin/{adminId}:
 *   get:
 *     summary: Get an admin by ID
 *     description: Retrieve an admin's details by ID.
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         description: The ID of the admin to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Admin retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     isLocked:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     name:
 *                       type: string
 *       '404':
 *         description: Admin not found
 *       '500':
 *         description: Server error
 */
router.get('/:adminId', AdminRoute.getAdminById);

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Get all admins
 *     description: Retrieve a paginated list of all admins.
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
 *       '200':
 *         description: List of admins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admins retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       isLocked:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       name:
 *                         type: string
 *       '500':
 *         description: Server error
 */
router.get('/', AdminRoute.getAllAdmins);

/**
 * @swagger
 * /admin/questions:
 *   post:
 *     summary: Create a new question with answers
 *     description: Adds a new question and its associated answers to the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: What is the capital of France?
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     answer:
 *                       type: string
 *                       example: Paris
 *                     isCorrect:
 *                       type: boolean
 *                       example: true
 *             required:
 *               - question
 *               - answers
 *     responses:
 *       '201':
 *         description: Question and answers created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question and answers created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                     answers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           answer:
 *                             type: string
 *                           isCorrect:
 *                             type: boolean
 *       '400':
 *         description: Validation error
 *       '500':
 *         description: Server error
 */
router.post('/createquestions', AdminRoute.createQuestionAndAnswers);

/**
 * @swagger
 * /admin/questions/questions:
 *   get:
 *     summary: Get all questions and answers
 *     description: Retrieve a list of all questions and their associated answers.
 *     responses:
 *       '200':
 *         description: List of questions and answers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Questions and answers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       question:
 *                         type: string
 *                       answers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             answer:
 *                               type: string
 *                             isCorrect:
 *                               type: boolean
 *       '500':
 *         description: Server error
 */
router.get('/questions', AdminRoute.getAllQuestionsAndAnswers);

/**
 * @swagger
 * /admin/questions/{questionId}:
 *   get:
 *     summary: Get a question by ID
 *     description: Retrieve a specific question and its associated answers by question ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Question and answers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question and answers retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                     answers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           answer:
 *                             type: string
 *                           isCorrect:
 *                             type: boolean
 *       '404':
 *         description: Question not found
 *       '500':
 *         description: Server error
 */
router.get('/questions/:questionId', AdminRoute.getQuestionAndAnswersById);

/**
 * @swagger
 * /admin/questions/{questionId}:
 *   put:
 *     summary: Update a question and its answers
 *     description: Update the details of an existing question and its answers by ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: What is the capital of Germany?
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     answer:
 *                       type: string
 *                       example: Berlin
 *                     isCorrect:
 *                       type: boolean
 *                       example: true
 *             required:
 *               - question
 *               - answers
 *     responses:
 *       '200':
 *         description: Question and answers updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question and answers updated successfully
 *       '400':
 *         description: Validation error
 *       '404':
 *         description: Question not found
 *       '500':
 *         description: Server error
 */
router.put('/questions/:questionId', AdminRoute.updateQuestionAndAnswers);

/**
 * @swagger
 * /admin/questions/{questionId}:
 *   delete:
 *     summary: Delete a question and its answers
 *     description: Remove a question and all its associated answers by ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Question and answers deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question and answers deleted successfully
 *       '404':
 *         description: Question not found
 *       '500':
 *         description: Server error
 */
router.delete('/questions/:questionId', AdminRoute.deleteQuestionAndAnswers);
/**
 * @swagger
 * /admin/questions/{questionId}/answers:
 *   post:
 *     summary: Add an answer to a question
 *     description: Create a new answer for a specific question by question ID. Requires the answerText and createdBy fields.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to add an answer to
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answerText:
 *                 type: string
 *                 example: Berlin
 *               createdBy:
 *                 type: string
 *                 example: 64b85d9457df934b8e3b9c21  // Example ObjectId for a user
 *             required:
 *               - answerText
 *               - createdBy
 *     responses:
 *       '201':
 *         description: Answer added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Answer created successfully
 *                 answer:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64b85d9457df934b8e3b9c21  // Example ObjectId for the answer
 *                     answerText:
 *                       type: string
 *                       example: Berlin
 *                     questionId:
 *                       type: string
 *                       example: 66dce642eb43b25d412cd811  // Example ObjectId for the question
 *                     createdBy:
 *                       type: string
 *                       example: 64b85d9457df934b8e3b9c21  // Example ObjectId for the user who created the answer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-09-08T23:20:22.877Z
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
 *                 error:
 *                   type: string
 *                   example: Required fields missing or invalid
 *       '404':
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question not found
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: Error creating answer
 */


/**
 * @swagger
 * /admin/questions/{questionId}/answers:
 *   get:
 *     summary: Get all answers for a question
 *     description: Retrieve all answers associated with a specific question by its ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to retrieve answers for
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: List of answers for the question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Answers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       answer:
 *                         type: string
 *                       isCorrect:
 *                         type: boolean
 *       '404':
 *         description: Question not found
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: "Answer validation failed: createdBy: Path `createdBy` is required., answerText: Path `answerText` is required."
 */


/**
 * @swagger
 * /admin/questions/{questionId}/answers/{answerId}:
 *   get:
 *     summary: Get an answer by ID for a question
 *     description: Retrieve a specific answer associated with a question by question ID and answer ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to retrieve the answer for
 *         schema:
 *           type: string
 *       - in: path
 *         name: answerId
 *         required: true
 *         description: The ID of the answer to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Answer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Answer retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     answer:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *       '404':
 *         description: Answer or question not found
 *       '500':
 *         description: Server error
 */
router.get('/questions/:questionId/answers/:answerId', AdminRoute.getAnswerByIdForQuestion);

/**
 * @swagger
 * /admin/questions/{questionId}/answers/{answerId}:
 *   put:
 *     summary: Update an answer for a question
 *     description: Update the details of a specific answer associated with a question by question ID and answer ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to update the answer for
 *         schema:
 *           type: string
 *       - in: path
 *         name: answerId
 *         required: true
 *         description: The ID of the answer to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *                 example: Berlin
 *               isCorrect:
 *                 type: boolean
 *                 example: true
 *             required:
 *               - answer
 *               - isCorrect
 *     responses:
 *       '200':
 *         description: Answer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Answer updated successfully
 *       '400':
 *         description: Validation error
 *       '404':
 *         description: Answer or question not found
 *       '500':
 *         description: Server error
 */
router.put('/questions/:questionId/answers/:answerId', AdminRoute.updateAnswerForQuestion);

/**
 * @swagger
 * /admin/questions/{questionId}/answers/{answerId}:
 *   delete:
 *     summary: Delete an answer for a question
 *     description: Remove a specific answer associated with a question by question ID and answer ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to delete the answer from
 *         schema:
 *           type: string
 *       - in: path
 *         name: answerId
 *         required: true
 *         description: The ID of the answer to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Answer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Answer deleted successfully
 *       '404':
 *         description: Answer or question not found
 *       '500':
 *         description: Server error
 */
router.delete('/questions/:questionId/answers/:answerId', AdminRoute.deleteAnswerForQuestion);








module.exports = router;
