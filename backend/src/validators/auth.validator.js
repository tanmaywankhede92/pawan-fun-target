const { body } = require('express-validator');

const loginValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 255 }).withMessage('Username must be 3-255 characters'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 255 }).withMessage('Password must be at most 255 characters'),
  body('device')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['M', 'W', 'D']).withMessage('Device must be one of M, W or D'),
  body('deviceUuid')
    .optional()
    .isLength({ max: 250 }).withMessage('Device UUID must be at most 250 characters'),
];

module.exports = { loginValidator };
