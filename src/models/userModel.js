// src/models/userModel.js
const pool = require('../config/db');

const createUser = async (username, email, hashedPassword, address) => {
  const result = await pool.query(
    'INSERT INTO users (username, email, password, address) VALUES ($1, $2, $3, $4) RETURNING *',
    [username, email, hashedPassword, address]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await pool.query(
    'SELECT user_id, username, email, address, created_at FROM users WHERE user_id = $1 AND is_deleted = false',
    [id]
  );
  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await pool.query(
    'SELECT user_id, username, email, address, created_at FROM users WHERE is_deleted = false ORDER BY created_at DESC'
  );
  return result.rows;
};

const updateUser = async (id, fields) => {
  const setString = Object.keys(fields)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  const values = Object.values(fields);
  const result = await pool.query(
    `UPDATE users SET ${setString}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $${values.length + 1} RETURNING user_id, username, email, address, updated_at`,
    [...values, id]
  );

  return result.rows[0];
};

module.exports = { createUser, findUserByEmail, findUserById, getAllUsers, updateUser };
