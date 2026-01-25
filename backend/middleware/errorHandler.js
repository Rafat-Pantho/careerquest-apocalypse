/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Global Error Handler Middleware
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Custom Error Class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response formatter with RPG flavor
 */
const formatErrorResponse = (err, req) => {
  const errorMessages = {
    400: '⚠️ Your request was malformed, hero. Check your inputs!',
    401: '🚫 Halt! You lack the credentials to pass!',
    403: '⛔ This area is forbidden to your kind, adventurer!',
    404: '🗺️ The treasure you seek does not exist in this realm!',
    409: '⚔️ Conflict detected! This resource is already claimed!',
    422: '📜 The scrolls you submitted are unreadable!',
    429: '🐢 Slow down, hero! You are making too many requests!',
    500: '💀 A dark force has struck our servers! The sages are investigating...'
  };

  return {
    success: false,
    message: err.message || errorMessages[err.statusCode] || errorMessages[500],
    errorCode: err.errorCode || `ERR_${err.statusCode}`,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      path: req.originalUrl,
      method: req.method
    })
  };
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🔥 Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError('🔮 Invalid magical identifier format!', 400, 'INVALID_ID');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(
      `⚔️ A hero with this ${field} already exists in the realm!`,
      409,
      'DUPLICATE_ENTRY'
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error = new ApiError(
      `📜 Validation failed: ${messages.join(', ')}`,
      422,
      'VALIDATION_ERROR'
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError('🔐 Your authentication token is corrupted!', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError('⏰ Your session has expired! Please login again.', 401, 'TOKEN_EXPIRED');
  }

  // Set default status code
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json(formatErrorResponse(error, req));
};

module.exports = errorHandler;
module.exports.ApiError = ApiError;
