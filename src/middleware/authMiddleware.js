const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    logger.warn('Access denied: Token missing');
    return res.status(401).json({ message: 'Access denied, token missing' });
  }

  const token = authHeader.split(' ')[1]; // Expect token in format "Bearer <token>"

  if (!token) {
    logger.warn('Access denied: Token missing');
    return res.status(401).json({ message: 'Access denied, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user_id; // Gán user_id cho request
    next();
  } catch (error) {
    logger.warn('Invalid token');
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;
