const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  // Lấy mã lỗi và thông báo từ lỗi hoặc dùng giá trị mặc định
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Chỉ trả stack trong môi trường phát triển
  const response = {
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
