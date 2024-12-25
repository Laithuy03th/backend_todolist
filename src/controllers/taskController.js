const { createTask, getTasksByUser, updateTask, deleteTask, isValidCategory } = require('../models/taskModel');

const logger = require('../utils/logger');

// Thêm nhiệm vụ mới
const addTaskController = async (req, res) => {
    const { title, description, dueDate, status, categoryId } = req.body;
    const userId = req.user.user_id;

    try {
        // Kiểm tra danh mục hợp lệ nếu có categoryId
        if (categoryId) {
            const categoryValid = await isValidCategory(categoryId, userId);
            if (!categoryValid) {
                throw new Error('Category ID không hợp lệ hoặc không thuộc về người dùng');
            }
        }

        const newTask = await createTask(userId, title, description, dueDate, status, categoryId);
        logger.info(`Task created for user ${userId}: ${newTask.task_id}`);
        res.status(201).json(newTask);
    } catch (error) {
        logger.error(`Error creating task for user ${userId}: ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};

// Lấy danh sách nhiệm vụ của người dùng
const getUserTasksController = async (req, res) => {
    const userId = req.user.user_id;
    const { status } = req.query; // Lọc theo trạng thái nếu có

    try {
        const tasks = await getTasksByUser(userId, status !== undefined ? JSON.parse(status) : null);
        logger.info(`Tasks retrieved for user ${userId}`);
        res.status(200).json(tasks);
    } catch (error) {
        logger.error(`Error retrieving tasks for user ${userId}: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};
const updateTaskController = async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.user_id;
    let fields = req.body;

    try {
        // Chuẩn hóa giá trị `status` (nếu tồn tại)
        if (fields.status !== undefined) {
            fields.status = fields.status === true || fields.status === 'true';
        }

        // Lọc các giá trị không hợp lệ
        const validFields = Object.fromEntries(
            Object.entries(fields).filter(([key, value]) => value !== undefined && value !== null)
        );

        // Nếu không có trường hợp lệ để cập nhật, trả về lỗi
        if (Object.keys(validFields).length === 0) {
            throw new Error('Không có trường hợp lệ để cập nhật');
        }

        // Kiểm tra danh mục hợp lệ nếu có
        if (validFields.category_id) {
            const categoryValid = await isValidCategory(validFields.category_id, userId);
            if (!categoryValid) {
                throw new Error('Category ID không hợp lệ hoặc không thuộc về người dùng');
            }
        }

        // Gọi hàm updateTask để xử lý cập nhật
        const updatedTask = await updateTask(taskId, userId, validFields);
        logger.info(`Task updated for user ${userId}: ${taskId}`);
        res.status(200).json(updatedTask);
    } catch (error) {
        logger.error(`Error updating task for user ${userId}: ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};



// Xóa nhiệm vụ (xóa mềm)
const deleteTaskController = async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.user_id;

    try {
        const deletedTask = await deleteTask(taskId, userId);
        logger.info(`Task deleted for user ${userId}: ${taskId}`);
        res.status(200).json(deletedTask);
    } catch (error) {
        logger.error(`Error deleting task for user ${userId}: ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    addTaskController,
    getUserTasksController,
    updateTaskController,
    deleteTaskController
};
