const { body } = require('express-validator');

const loginValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 255 }).withMessage('Username must be 3-255 characters'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('device')
    .optional()
    .isLength({ max: 50 }).withMessage('Device must be at most 50 characters'),
  body('deviceUuid')
    .optional()
    .isLength({ max: 200 }).withMessage('Device UUID must be at most 200 characters'),
];

const refreshValidator = [
  body('refreshToken')
    .optional()
    .isJWT().withMessage('Refresh token must be a valid JWT'),
];

const logoutValidator = refreshValidator;

module.exports = { loginValidator, refreshValidator, logoutValidator };
