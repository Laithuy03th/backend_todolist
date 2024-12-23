const { createTask, getTasksByUser, updateTask, deleteTask } = require('../models/taskModel');
const logger = require('../utils/logger');

// Thêm nhiệm vụ mới
const addTaskController = async (req, res) => {
    const { title, description, dueDate, status, categoryId } = req.body;
    const userId = req.user.user_id;

    try {
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
    const { status } = req.query; // Lọc theo status nếu có

    try {
        const tasks = await getTasksByUser(userId, status !== undefined ? JSON.parse(status) : null);
        logger.info(`Tasks retrieved for user ${userId}`);
        res.status(200).json(tasks);
    } catch (error) {
        logger.error(`Error retrieving tasks for user ${userId}: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật nhiệm vụ
const updateTaskController = async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.user_id;
    const fields = req.body;

    try {
        const updatedTask = await updateTask(taskId, userId, fields);
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
