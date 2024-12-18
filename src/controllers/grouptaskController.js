const { createGroupTask, getGroupTasks, updateGroupTask, deleteGroupTask } = require('../models/groupTaskModel');
const logger = require('../utils/logger');
const { checkUserRoleInGroup } = require('../models/groupModel');

const createNewGroupTask = async (req, res) => {
  const { task_id, group_id, assigned_by, due_date, status } = req.body;
  const userId = req.user; 
  try {
 // Kiểm tra quyền của người dùng
 const role = await checkUserRoleInGroup(userId, group_id);
 if (role !== 'admin') {
   logger.warn(`User ${userId} không có quyền tạo nhiệm vụ nhóm cho group ${group_id}`);
   return res.status(403).json({ message: 'Bạn không có quyền tạo nhiệm vụ nhóm' });
 }


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
  const userId = req.user;

  try {
 // Kiểm tra xem người dùng có thuộc nhóm không
 const role = await checkUserRoleInGroup(userId, group_id);
 if (!role) {
   logger.warn(`User ${userId} không có quyền xem nhiệm vụ nhóm của group ${group_id}`);
   return res.status(403).json({ message: 'Bạn không có quyền xem nhiệm vụ nhóm này' });
 }

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
  const userId = req.user;

  try {
 // Kiểm tra quyền của người dùng (admin hoặc người thực hiện nhiệm vụ)
 const taskDetails = await getGroupTasks(group_task_id);
 if (!taskDetails) {
   logger.warn(`Group Task ${group_task_id} không tồn tại.`);
   return res.status(404).json({ message: 'Nhiệm vụ nhóm không tồn tại' });
 }

 const role = await checkUserRoleInGroup(userId, taskDetails.group_id);
 if (role !== 'admin' && taskDetails.assigned_by !== userId) {
   logger.warn(`User ${userId} không có quyền cập nhật nhiệm vụ nhóm ${group_task_id}`);
   return res.status(403).json({ message: 'Bạn không có quyền cập nhật nhiệm vụ nhóm này' });
 }

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
  const userId = req.user;

  try {
  // Kiểm tra quyền của người dùng
  const taskDetails = await getGroupTasks(group_task_id);
  if (!taskDetails) {
    logger.warn(`Group Task ${group_task_id} không tồn tại.`);
    return res.status(404).json({ message: 'Nhiệm vụ nhóm không tồn tại' });
  }

  const role = await checkUserRoleInGroup(userId, taskDetails.group_id);
  if (role !== 'admin') {
    logger.warn(`User ${userId} không có quyền xóa nhiệm vụ nhóm ${group_task_id}`);
    return res.status(403).json({ message: 'Bạn không có quyền xóa nhiệm vụ nhóm này' });
  }


    await deleteGroupTask(group_task_id);
    logger.info(`Group Task ${group_task_id} deleted.`);
    res.status(200).json({ message: 'Nhiệm vụ nhóm đã được xóa' });
  } catch (error) {
    logger.error(`Error deleting group task ${group_task_id}: ${error.message}`);
    res.status(500).json({ message: 'Error xóa nhiệm vụ nhóm' });
  }
};

module.exports = { createNewGroupTask, getAllGroupTasks, modifyGroupTask, removeGroupTask };
