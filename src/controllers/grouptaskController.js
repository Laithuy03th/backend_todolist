const { createGroupTask, getGroupTasks, updateGroupTask, deleteGroupTask } = require('../models/groupTaskModel');
const logger = require('../utils/logger');

const createNewGroupTask = async (req, res) => {
  const { task_id, group_id, assigned_by, due_date, status } = req.body;

  try {
    const groupTask = await createGroupTask(task_id, group_id, assigned_by, due_date, status);
    logger.info(`Group Task created: Task ${task_id} in Group ${group_id} by User ${assigned_by}`);
    res.status(201).json(groupTask);
  } catch (error) {
    logger.error(`Error creating group task: ${error.message}`);
    res.status(500).json({ message: 'Error tạo nhiệm vụ nhóm' });
  }
};

const getAllGroupTasks = async (req, res) => {
  const { group_id } = req.params;

  try {
    const groupTasks = await getGroupTasks(group_id);
    res.status(200).json(groupTasks);
  } catch (error) {
    logger.error(`Error fetching group tasks for group ${group_id}: ${error.message}`);
    res.status(500).json({ message: 'Error lấy nhiệm vụ nhóm' });
  }
};

const modifyGroupTask = async (req, res) => {
  const { group_task_id } = req.params;
  const fields = req.body;

  try {
    const updatedGroupTask = await updateGroupTask(group_task_id, fields);
    if (!updatedGroupTask) {
      logger.warn(`Group Task ${group_task_id} not found.`);
      return res.status(404).json({ message: 'Nhiệm vụ nhóm không tồn tại' });
    }
    logger.info(`Group Task ${group_task_id} updated.`);
    res.status(200).json(updatedGroupTask);
  } catch (error) {
    logger.error(`Error updating group task ${group_task_id}: ${error.message}`);
    res.status(500).json({ message: 'Error cập nhật nhiệm vụ nhóm' });
  }
};

const removeGroupTask = async (req, res) => {
  const { group_task_id } = req.params;

  try {
    await deleteGroupTask(group_task_id);
    logger.info(`Group Task ${group_task_id} deleted.`);
    res.status(200).json({ message: 'Nhiệm vụ nhóm đã được xóa' });
  } catch (error) {
    logger.error(`Error deleting group task ${group_task_id}: ${error.message}`);
    res.status(500).json({ message: 'Error xóa nhiệm vụ nhóm' });
  }
};

module.exports = { createNewGroupTask, getAllGroupTasks, modifyGroupTask, removeGroupTask };
