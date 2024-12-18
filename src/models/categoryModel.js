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

// Gán danh mục cho một task (kèm kiểm tra quyền)
const assignCategoryToTask = async (taskId, categoryId, userId) => {
  // Kiểm tra xem user có quyền với task hay không
  const taskCheck = await pool.query(
    `SELECT user_id FROM tasks WHERE task_id = $1`,
    [taskId]
  );

  const taskOwner = taskCheck.rows[0]?.user_id;
  if (!taskOwner) throw new Error('Nhiệm vụ không tồn tại');
  if (taskOwner !== userId) throw new Error('Bạn không có quyền gán danh mục cho nhiệm vụ này');

  // Thực hiện gán danh mục cho task
  const result = await pool.query(
    'INSERT INTO task_categories (task_id, category_id) VALUES ($1, $2) RETURNING *',
    [taskId, categoryId]
  );

  return result.rows[0];
};

// Xóa danh mục
const deleteCategory = async (categoryId) => {
  const result = await pool.query(
    'DELETE FROM categories WHERE category_id = $1 RETURNING *',
    [categoryId]
  );
  return result.rows[0];
};

module.exports = { createCategory, getAllCategories, assignCategoryToTask, deleteCategory };
