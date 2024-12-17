const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, findUserById, getAllUsers } = require('../models/userModel');
const logger = require('../utils/logger');

const registerUser = async (req, res) => {
  const { username, email, password, address } = req.body;

  try {
    // Kiểm tra sự tồn tại người dùng 
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      logger.warn(`Registration failed: Email ${email} đã được sử dụng.`);
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo người dùng mới
    const newUser = await createUser(username, email, hashedPassword, address);

    // Tạo token JWT
    const token = jwt.sign({ user_id: newUser.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      token,
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        address: newUser.address,
      },
    });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tìm người dùng theo email
    const user = await findUserByEmail(email);
    if (!user) {
      logger.warn(`Login failed: Email ${email} không tồn tại.`);
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed: Mật khẩu không chính xác cho email ${email}.`);
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    // Tạo token JWT
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        address: user.address,
      },
    });
  } catch (error) {
    logger.error(`Error logging in user: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Endpoint để lấy tất cả người dùng (dành cho admin)
const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { registerUser, loginUser, getAllUsersController };
