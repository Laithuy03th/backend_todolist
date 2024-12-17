const { createTask, getTasksByUserId, updateTask, deleteTask } = require('../models/taskModel');
const logger = require('../utils/logger');

const createNewTask = async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  const userId = req.user; // Lấy user_id từ middleware xác thực

  try {
    const newTask = await createTask(userId, title, description, status, priority, due_date);
    logger.info(`Task created by user ${userId}: ${title}`);
    res.status(201).json(newTask);
  } catch (error) {
    logger.error(`Error creating task: ${error.message}`);
    res.status(500).json({ message: 'Error tạo nhiệm vụ' });
  }
};

const getAllTasks = async (req, res) => {
  const userId = req.user;

  try {
    const tasks = await getTasksByUserId(userId);
    res.status(200).json(tasks);
  } catch (error) {
    logger.error(`Error fetching tasks for user ${userId}: ${error.message}`);
    res.status(500).json({ message: 'Error lấy nhiệm vụ' });
  }
};

const modifyTask = async (req, res) => {
  const taskId = req.params.id;
  const fields = req.body;
  const userId = req.user;

  try {
    // Kiểm tra xem nhiệm vụ có thuộc về người dùng không
    const task = await updateTask(taskId, fields);
    if (!task) {
      logger.warn(`Task ${taskId} not found for user ${userId}`);
      return res.status(404).json({ message: 'Nhiệm vụ không tồn tại' });
    }
    logger.info(`Task ${taskId} updated by user ${userId}`);
    res.status(200).json(task);
  } catch (error) {
    logger.error(`Error updating task ${taskId}: ${error.message}`);
    res.status(500).json({ message: 'Error cập nhật nhiệm vụ' });
  }
};

const removeTask = async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user;

  try {
    await deleteTask(taskId);
    logger.info(`Task ${taskId} deleted by user ${userId}`);
    res.status(200).json({ message: 'Nhiệm vụ đã được xóa' });
  } catch (error) {
    logger.error(`Error deleting task ${taskId}: ${error.message}`);
    res.status(500).json({ message: 'Error xóa nhiệm vụ' });
  }
};

module.exports = { createNewTask, getAllTasks, modifyTask, removeTask };
