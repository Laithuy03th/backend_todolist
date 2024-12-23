const pool = require('../config/db');

// Tạo danh mục mới
const createCategory = async (userId, name) => {
    try {
        const result = await pool.query(
            `INSERT INTO categories (user_id, name) 
             VALUES ($1, $2) RETURNING category_id, name, created_at`,
            [userId, name]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error(`Error creating category: ${error.message}`);
    }
};

// Lấy danh sách danh mục của người dùng
const getCategoriesByUser = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT category_id, name, created_at 
             FROM categories WHERE user_id = $1`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        throw new Error(`Error retrieving categories: ${error.message}`);
    }
};

// Lấy danh sách nhiệm vụ trong danh mục
const getTasksByCategory = async (categoryId, userId) => {
    try {
        // Kiểm tra xem category_id có thuộc về user_id hay không
        const categoryCheck = await pool.query(
            `SELECT category_id FROM categories WHERE category_id = $1 AND user_id = $2`,
            [categoryId, userId]
        );
        if (categoryCheck.rowCount === 0) {
            throw new Error('Category not found or you do not have permission to access it');
        }

        // Lấy danh sách nhiệm vụ trong danh mục
        const result = await pool.query(
            `SELECT task_id, title, description, due_date, status, created_at 
             FROM tasks WHERE category_id = $1 AND is_deleted = false`,
            [categoryId]
        );
        return result.rows;
    } catch (error) {
        throw new Error(`Error retrieving tasks by category: ${error.message}`);
    }
};

// Cập nhật danh mục
const updateCategory = async (categoryId, userId, name) => {
    try {
        const result = await pool.query(
            `UPDATE categories SET name = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE category_id = $2 AND user_id = $3 RETURNING category_id, name, updated_at`,
            [name, categoryId, userId]
        );
        if (result.rowCount === 0) {
            throw new Error('Category not found or you do not have permission to update it');
        }
        return result.rows[0];
    } catch (error) {
        throw new Error(`Error updating category: ${error.message}`);
    }
};

// Xóa danh mục (tự động xóa nhiệm vụ liên quan)
const deleteCategory = async (categoryId, userId) => {
    try {
        // Kiểm tra quyền sở hữu danh mục
        const categoryCheck = await pool.query(
            `SELECT category_id FROM categories WHERE category_id = $1 AND user_id = $2`,
            [categoryId, userId]
        );
        if (categoryCheck.rowCount === 0) {
            throw new Error('Category not found or you do not have permission to delete it');
        }

        // Xóa tất cả các nhiệm vụ liên quan đến danh mục
        await pool.query(
            `DELETE FROM tasks WHERE category_id = $1`,
            [categoryId]
        );

        // Xóa danh mục
        const result = await pool.query(
            `DELETE FROM categories WHERE category_id = $1 AND user_id = $2 RETURNING category_id, name`,
            [categoryId, userId]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error(`Error deleting category and related tasks: ${error.message}`);
    }
};

module.exports = {
    createCategory,
    getCategoriesByUser,
    getTasksByCategory,
    updateCategory,
    deleteCategory
};
