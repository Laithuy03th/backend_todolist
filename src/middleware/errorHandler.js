const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
      message: err.message || 'Internal Server Error',
      details: err.details || 'An unexpected error occurred',
  });
};

module.exports = errorHandler;

