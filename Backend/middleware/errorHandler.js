/**
 * Error Handling Middleware
 * Centralized error handling for all routes
 */

const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * Global Error Handler Middleware
 * @param {Error} err - Error object
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || ERROR_MESSAGES.SERVER_ERROR;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = ERROR_MESSAGES.UNAUTHORIZED;
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
};

/**
 * Not Found Handler Middleware
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
