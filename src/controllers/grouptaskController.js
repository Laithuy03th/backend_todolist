const {
  createGroupTask,
  updateGroupTask,
  deleteGroupTask,
  getGroupTasks,
  updateTaskStatus
} = require('../models/groupTaskModel');

const logger = require('../utils/logger');

// Tạo nhiệm vụ nhóm
const createGroupTaskController = async (req, res) => {
  const { groupId, title, description, dueDate, assignedTo } = req.body;
  const adminId = req.user.user_id;

  try {
    const task = await createGroupTask(groupId, adminId, title, description, dueDate, assignedTo);
    logger.info(`Task created successfully by admin ${adminId} in group ${groupId}`);
    res.status(201).json(task);
  } catch (error) {
    logger.error(`Failed to create task: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật nhiệm vụ nhóm

const updateGroupTaskController = async (req, res) => {
  const { group_task_id } = req.params; 
  const { groupId, updates } = req.body;
  const adminId = req.user.user_id;

  try {
    const updatedTask = await updateGroupTask(group_task_id, adminId, groupId, updates);
    logger.info(`Task ${group_task_id} updated successfully by admin ${adminId}`);
    res.status(200).json(updatedTask);
  } catch (error) {
    logger.error(`Failed to update task ${group_task_id}: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};


// Xóa nhiệm vụ nhóm
const deleteGroupTaskController = async (req, res) => {
  const { group_task_id } = req.params; // Sử dụng group_task_id thay vì taskId
  const { groupId } = req.body;
  const adminId = req.user.user_id;

  try {
    const deletedTask = await deleteGroupTask(group_task_id, adminId, groupId);
    logger.info(`Task ${group_task_id} deleted successfully by admin ${adminId}`);
    res.status(200).json(deletedTask);
  } catch (error) {
    logger.error(`Failed to delete task ${group_task_id}: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách nhiệm vụ nhóm
const getGroupTasksController = async (req, res) => {
  const { groupId } = req.query; 
  const userId = req.user.user_id;
  const assignedOnly = req.query.assignedOnly === 'true';

  try {
    const tasks = await getGroupTasks(groupId, userId, assignedOnly);
    logger.info(`Fetched tasks for group ${groupId} by user ${userId}`);
    res.status(200).json(tasks);
  } catch (error) {
    logger.error(`Failed to fetch tasks for group ${groupId}: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật trạng thái nhiệm vụ nhóm
const updateTaskStatusController = async (req, res) => {
  const { group_task_id } = req.params; 
  const { status } = req.body;
  const userId = req.user.user_id;

  try {
    const updatedStatus = await updateTaskStatus(group_task_id, userId, status);
    logger.info(`Task ${group_task_id} status updated to ${status} by user ${userId}`);
    res.status(200).json(updatedStatus);
  } catch (error) {
    logger.error(`Failed to update status for task ${group_task_id}: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};


module.exports = {
  createGroupTaskController,
  updateGroupTaskController,
  deleteGroupTaskController,
  getGroupTasksController,
  updateTaskStatusController
};
