const pool = require('../config/db');

// Tạo người dùng mới
const createUser = async (username, email, hashedPassword, address) => {
    try {
        const result = await pool.query(
            `INSERT INTO users (username, email, password, address) 
             VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, address, created_at`,
            [username, email, hashedPassword, address]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error(`Error creating user: ${error.message}`);
    }
};

// Tìm người dùng qua email
const findUserByEmail = async (email) => {
    try {
        const result = await pool.query(
            `SELECT user_id, username, email, password, address 
             FROM users WHERE email = $1 AND is_deleted = false`,
            [email]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error(`Error finding user by email: ${error.message}`);
    }
};

// Tìm người dùng qua ID
const findUserById = async (id) => {
    try {
        const result = await pool.query(
            `SELECT user_id, username, email, address, created_at 
             FROM users WHERE user_id = $1 AND is_deleted = false`,
            [id]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error(`Error finding user by ID: ${error.message}`);
    }
};

// Cập nhật thông tin cá nhân của người dùng
const updateUser = async (id, fields) => {
    try {
        const allowedFields = ['username', 'address', 'password']; // Giới hạn các trường có thể cập nhật
        const updateData = Object.keys(fields)
            .filter((key) => allowedFields.includes(key))
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');

        if (!updateData) {
            throw new Error('No valid fields to update');
        }

        const values = Object.values(fields);
        const result = await pool.query(
            `UPDATE users SET ${updateData}, updated_at = CURRENT_TIMESTAMP 
             WHERE user_id = $${values.length + 1} AND is_deleted = false 
             RETURNING user_id, username, email, address, updated_at`,
            [...values, id]
        );

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error updating user: ${error.message}`);
    }
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
};
