const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, updateUser, findUserById } = require('../models/userModel');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_key';

// Đăng ký người dùng mới
const registerUser = async (req, res) => {
    const { username, email, password, address } = req.body;

    try {
        // Kiểm tra lỗi từ express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Kiểm tra email đã tồn tại
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
        const token = jwt.sign({ user_id: newUser.user_id }, JWT_SECRET, { expiresIn: '1h' });

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
      logger.error(`Error registering user: ${error.stack}`);
      res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
      
};

// Đăng nhập người dùng
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Kiểm tra lỗi từ express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Tìm người dùng qua email
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
        const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '1h' });

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
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};

// Cập nhật thông tin cá nhân
const updateUserProfile = async (req, res) => {
    const { user_id } = req.user; // Lấy ID từ token
    const updates = req.body;

    try {
        const updatedUser = await updateUser(user_id, updates);
        if (!updatedUser) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        logger.error(`Error updating user: ${error.message}`);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};

// Lấy thông tin cá nhân
const getUserProfile = async (req, res) => {
    const { user_id } = req.user; // Lấy ID từ token

    try {
        const user = await findUserById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        res.status(200).json({ user });
    } catch (error) {
        logger.error(`Error retrieving user profile: ${error.message}`);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getUserProfile };
