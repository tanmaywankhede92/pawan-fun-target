const logger = require('../config/logger');
const { HTTP_STATUS } = require('../constants');
const ApiError = require('../utils/ApiError');
const config = require('../config');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  if (!(err instanceof ApiError)) {
    if (err.name === 'SequelizeValidationError') {
      statusCode = HTTP_STATUS.BAD_REQUEST;
      message = 'Validation Error';
      errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    } else if (err.name === 'SequelizeUniqueConstraintError') {
      statusCode = HTTP_STATUS.CONFLICT;
      message = 'Resource already exists';
      errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = HTTP_STATUS.UNAUTHORIZED;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = HTTP_STATUS.UNAUTHORIZED;
      message = 'Token expired';
    } else {
      logger.error('Unhandled error:', err);
    }
  }

  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(config.env === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
