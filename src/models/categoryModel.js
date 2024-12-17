const pool = require('../config/db');

const createCategory = async (name) => {
  const result = await pool.query(
    'INSERT INTO categories (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
};

const getAllCategories = async () => {
  const result = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
  return result.rows;
};

const assignCategoryToTask = async (taskId, categoryId) => {
  const result = await pool.query(
    'INSERT INTO task_categories (task_id, category_id) VALUES ($1, $2) RETURNING *',
    [taskId, categoryId]
  );
  return result.rows[0];
};

module.exports = { createCategory, getAllCategories, assignCategoryToTask };
