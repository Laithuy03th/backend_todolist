const pool = require('../config/db');

// Thêm nhiệm vụ cá nhân mới
const createTask = async (userId, title, description, dueDate, status = false, categoryId) => {
    try {
        // Kiểm tra tính hợp lệ của category_id
        if (categoryId) {
            const categoryValid = await isValidCategory(categoryId, userId);
            if (!categoryValid) {
                throw new Error('Category ID không hợp lệ hoặc không thuộc về người dùng');
            }
        }

        const result = await pool.query(
            `INSERT INTO tasks (user_id, title, description, due_date, status, category_id) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING task_id, title, description, due_date, status, category_id, created_at`,
            [userId, title, description, dueDate, status, categoryId]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error(`Error creating task: ${error.message}`);
    }
};

// Lấy danh sách nhiệm vụ của người dùng (kèm lọc theo status)
const getTasksByUser = async (userId, status = null) => {
    try {
        let query = `
            SELECT task_id, title, description, due_date, status, category_id, created_at 
            FROM tasks 
            WHERE user_id = $1 AND is_deleted = false`;
        const values = [userId];

        // Nếu cần lọc theo status
        if (status !== null) {
            query += ` AND status = $2`;
            values.push(status);
        }

        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        throw new Error(`Error retrieving tasks: ${error.message}`);
    }
};

const updateTask = async (taskId, userId, fields) => {
    try {
        // Kiểm tra xem nhiệm vụ có thuộc về người dùng không
        const taskOwner = await isTaskOwner(taskId, userId);
        if (!taskOwner) {
            throw new Error('Người dùng không có quyền chỉnh sửa nhiệm vụ này');
        }

        // Chuẩn hóa giá trị `status` nếu tồn tại
        if (fields.status !== undefined) {
            fields.status = fields.status === true || fields.status === 'true';
        }

        // Kiểm tra tính hợp lệ của `category_id` nếu được cập nhật
        if (fields.category_id) {
            const categoryValid = await isValidCategory(fields.category_id, userId);
            if (!categoryValid) {
                throw new Error('Category ID không hợp lệ hoặc không thuộc về người dùng');
            }
        }

        // Xây dựng câu lệnh SQL động
        const allowedFields = ['title', 'description', 'due_date', 'status', 'category_id'];
        const updates = Object.keys(fields)
            .filter((key) => allowedFields.includes(key))
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');

        if (!updates) {
            throw new Error('Không có trường hợp lệ để cập nhật');
        }

        const values = Object.values(fields);

        
        // Thêm console.log để kiểm tra giá trị
        console.log('Fields:', fields); // Hiển thị các field đang cập nhật
        console.log('Values:', values); // Hiển thị giá trị truyền vào câu lệnh SQL

        const result = await pool.query(
            `UPDATE tasks 
             SET ${updates}, updated_at = CURRENT_TIMESTAMP 
             WHERE task_id = $${values.length + 1} AND user_id = $${values.length + 2} AND is_deleted = false 
             RETURNING task_id, title, description, due_date, status, category_id, updated_at`,
            [...values, taskId, userId]
        );

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error updating task: ${error.message}`);
    }
};



// Xóa nhiệm vụ (xóa mềm)
const deleteTask = async (taskId, userId) => {
    try {
        // Kiểm tra xem nhiệm vụ có thuộc về người dùng không
        const taskOwner = await isTaskOwner(taskId, userId);
        if (!taskOwner) {
            throw new Error('Người dùng không có quyền xóa nhiệm vụ này');
        }

        const result = await pool.query(
            `UPDATE tasks SET is_deleted = true, updated_at = CURRENT_TIMESTAMP 
             WHERE task_id = $1 
             RETURNING task_id, title, description, due_date, status, category_id, updated_at`,
            [taskId]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error(`Error deleting task: ${error.message}`);
    }
};

// Kiểm tra danh mục hợp lệ
const isValidCategory = async (categoryId, userId) => {
    try {
        const result = await pool.query(
            `SELECT category_id 
             FROM categories 
             WHERE category_id = $1 AND user_id = $2`,
            [categoryId, userId]
        );
        return result.rowCount > 0;
    } catch (error) {
        throw new Error(`Error validating category: ${error.message}`);
    }
};

// Kiểm tra xem nhiệm vụ có thuộc về người dùng không
const isTaskOwner = async (taskId, userId) => {
    try {
        const result = await pool.query(
            `SELECT task_id 
             FROM tasks 
             WHERE task_id = $1 AND user_id = $2 AND is_deleted = false`,
            [taskId, userId]
        );
        return result.rowCount > 0;
    } catch (error) {
        throw new Error(`Error verifying task ownership: ${error.message}`);
    }
};

module.exports = {
    createTask,
    getTasksByUser,
    updateTask,
    deleteTask,
    isValidCategory,
};
