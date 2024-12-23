const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const logger = require('../utils/logger');
const pool = require('../config/db');

dotenv.config();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      logger.warn('Access denied: Authorization header is missing');
      return res.status(401).json({ message: 'Access denied: Token missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      logger.warn('Access denied: Token missing from header');
      return res.status(401).json({ message: 'Access denied: Token missing' });
    }

    try {
      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kiểm tra user trong database
      const userQuery = await pool.query('SELECT * FROM users WHERE user_id = $1 AND is_deleted = false', [decoded.userId]);
      if (userQuery.rowCount === 0) {
        logger.warn(`Invalid token: User does not exist or has been deleted (user_id=${decoded.userId})`);
        return res.status(401).json({ message: 'Invalid token: User not found' });
      }

      // Gắn thông tin user vào request
      req.user = userQuery.rows[0];
      logger.info(`User authenticated: user_id=${req.user.user_id}`);
      next();
    } catch (tokenError) {
      logger.error(`Token verification failed: ${tokenError.message}`);
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = authenticate;
