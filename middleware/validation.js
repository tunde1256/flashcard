const { body, validationResult } = require('express-validator');
const Admin = require('../model/admin'); // Adjust the path as needed
const bcrypt = require('bcrypt');
const logger = require('../logger'); // Import the logger

// Validation middleware
const validateCreateAdmin = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/)
        .withMessage('Password must contain at least one special character'),
    body('name').notEmpty().withMessage('Name is required')
];
const validateLoginAdmin = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];
const loginValidator = [
    // Validate username or email
    body('username').optional().isString().withMessage('Username must be a string'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
];

 const validateCreateUser = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/)
        .withMessage('Password must contain at least one special character')
];
module.exports ={
    validateCreateUser,
    validateCreateAdmin,
    validateLoginAdmin,
    loginValidator

}