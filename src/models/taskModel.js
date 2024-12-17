const pool = require('../config/db');

const createTask = async (userId, title, description, status = 'pending', priority = 'normal', dueDate = null) => {
  const result = await pool.query(
    `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, title, description, status, priority, dueDate]
  );
  return result.rows[0];
};

const getTasksByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const updateTask = async (taskId, fields) => {
  const setString = Object.keys(fields)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');
  const values = Object.values(fields);
  const result = await pool.query(
    `UPDATE tasks SET ${setString}, updated_at = CURRENT_TIMESTAMP WHERE task_id = $${values.length + 1} RETURNING *`,
    [...values, taskId]
  );
  return result.rows[0];
};

const deleteTask = async (taskId) => {
  await pool.query('DELETE FROM tasks WHERE task_id = $1', [taskId]);
};

module.exports = { createTask, getTasksByUserId, updateTask, deleteTask };
