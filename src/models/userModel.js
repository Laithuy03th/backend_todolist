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
  const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  return result.rows;
};

module.exports = { createUser, findUserByEmail, findUserById, getAllUsers };
