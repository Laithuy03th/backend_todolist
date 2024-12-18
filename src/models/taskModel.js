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

const findTaskById = async (taskId) => {
  const result = await pool.query('SELECT * FROM tasks WHERE task_id = $1', [taskId]);
  return result.rows[0];
};

// Cập nhật task (kiểm tra quyền)
const updateTask = async (taskId, fields, userId) => {
  // Kiểm tra xem task có thuộc quyền sở hữu của user không
  const taskCheck = await pool.query(
    `SELECT user_id FROM tasks WHERE task_id = $1`,
    [taskId]
  );

  const taskOwner = taskCheck.rows[0]?.user_id;
  if (!taskOwner) throw new Error('Task không tồn tại');
  if (taskOwner !== userId) throw new Error('Bạn không có quyền cập nhật task này');

  // Cập nhật task
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

// Xóa task (kiểm tra quyền)
const deleteTask = async (taskId, userId) => {
  // Kiểm tra xem task có thuộc quyền sở hữu của user không
  const taskCheck = await pool.query(
    `SELECT user_id FROM tasks WHERE task_id = $1`,
    [taskId]
  );

  const taskOwner = taskCheck.rows[0]?.user_id;
  if (!taskOwner) throw new Error('Task không tồn tại');
  if (taskOwner !== userId) throw new Error('Bạn không có quyền xóa task này');

  // Xóa task
  await pool.query('DELETE FROM tasks WHERE task_id = $1', [taskId]);
};

module.exports = { createTask, getTasksByUserId, updateTask, deleteTask, findTaskById };
