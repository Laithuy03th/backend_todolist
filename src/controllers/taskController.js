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
    const fields = req.body;

    try {
        // Lọc các giá trị không hợp lệ
        const validFields = Object.fromEntries(
            Object.entries(fields).filter(([key, value]) => value !== undefined && value !== null)
        );

        // Kiểm tra trạng thái và logic
        if (validFields.status !== undefined) {
            const currentTask = await getTasksByUser(userId, null);
            const taskToUpdate = currentTask.find(task => task.task_id === parseInt(taskId));

            if (!taskToUpdate) {
                throw new Error('Nhiệm vụ không tồn tại hoặc không thuộc về người dùng');
            }

            if (taskToUpdate.status === true && validFields.status === false) {
                throw new Error('Không thể chuyển trạng thái từ hoàn thành về chưa hoàn thành');
            }
        }

        // Kiểm tra danh mục hợp lệ nếu có
        if (validFields.category_id) {
            const categoryValid = await isValidCategory(validFields.category_id, userId);
            if (!categoryValid) {
                throw new Error('Category ID không hợp lệ hoặc không thuộc về người dùng');
            }
        }

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
