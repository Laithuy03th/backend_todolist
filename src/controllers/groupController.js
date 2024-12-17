const { createGroup, getGroupsByUserId, addUserToGroup, checkUserRoleInGroup } = require('../models/groupModel');
const logger = require('../utils/logger');

const createNewGroup = async (req, res) => {
  const { name, description } = req.body;

  try {
    const group = await createGroup(name, description);
    logger.info(`Group created: ${name}`);
    res.status(201).json(group);
  } catch (error) {
    logger.error(`Error creating group: ${error.message}`);
    res.status(500).json({ message: 'Error tạo nhóm' });
  }
};

const getUserGroups = async (req, res) => {
  const userId = req.user;

  try {
    const groups = await getGroupsByUserId(userId);
    res.status(200).json(groups);
  } catch (error) {
    logger.error(`Error fetching groups for user ${userId}: ${error.message}`);
    res.status(500).json({ message: 'Error lấy nhóm' });
  }
};

const inviteMember = async (req, res) => {
  const inviterId = req.user; 
  const { group_id, user_id } = req.body;

  try {
    
    const role = await checkUserRoleInGroup(inviterId, group_id);
    if (role !== 'admin') {
      logger.warn(`User ${inviterId} không có quyền mời thành viên vào group ${group_id}`);
      return res.status(403).json({ message: 'Bạn không có quyền mời thành viên vào nhóm này' });
    }

    // Thêm thành viên mới vào nhóm với role mặc định là 'member'
    const newMember = await addUserToGroup(user_id, group_id, 'member');

    logger.info(`User ${user_id} được mời vào group ${group_id} bởi admin ${inviterId}`);
    res.status(201).json({ message: 'Mời thành viên thành công', newMember });
  } catch (error) {
    logger.error(`Lỗi khi mời thành viên vào group ${group_id}: ${error.message}`);
    res.status(500).json({ message: 'Lỗi khi mời thành viên vào nhóm' });
  }
};



module.exports = { createNewGroup, getUserGroups, inviteMember };
