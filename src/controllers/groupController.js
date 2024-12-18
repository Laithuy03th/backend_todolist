const { createGroup, getGroupsByUserId, addUserToGroup, checkUserRoleInGroup } = require('../models/groupModel');
const logger = require('../utils/logger');

// Tạo nhóm mới
const createNewGroup = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user; // Lấy thông tin user từ middleware authenticate

  try {
    // Tạo nhóm và thêm người tạo vào với vai trò admin
    const group = await createGroup(name, description);
    await addUserToGroup(userId, group.group_id, 'admin');

    logger.info(`Group created: ${name} bởi user ${userId}`);
    res.status(201).json(group);
  } catch (error) {
    logger.error(`Error creating group: ${error.message}`);
    res.status(500).json({ message: 'Lỗi khi tạo nhóm' });
  }
};

// Lấy danh sách các nhóm của người dùng
const getUserGroups = async (req, res) => {
  const userId = req.user;

  try {
    const groups = await getGroupsByUserId(userId);
    res.status(200).json(groups);
  } catch (error) {
    logger.error(`Error fetching groups for user ${userId}: ${error.message}`);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách nhóm' });
  }
};

// Mời thành viên vào nhóm
const inviteMember = async (req, res) => {
  const inviterId = req.user; // Người thực hiện mời
  const { group_id, user_id } = req.body;

  try {
    // Kiểm tra quyền của người mời
    const role = await checkUserRoleInGroup(inviterId, group_id);
    if (role !== 'admin') {
      logger.warn(`User ${inviterId} không có quyền mời thành viên vào group ${group_id}`);
      return res.status(403).json({ message: 'Bạn không có quyền mời thành viên vào nhóm này' });
    }

    // Kiểm tra xem user đã là thành viên của nhóm chưa
    const existingRole = await checkUserRoleInGroup(user_id, group_id);
    if (existingRole) {
      logger.warn(`User ${user_id} đã là thành viên của group ${group_id}`);
      return res.status(400).json({ message: 'Người dùng đã là thành viên của nhóm' });
    }

    // Thêm thành viên mới vào nhóm với vai trò mặc định là 'member'
    const newMember = await addUserToGroup(user_id, group_id, 'member');

    logger.info(`User ${user_id} được mời vào group ${group_id} bởi admin ${inviterId}`);
    res.status(201).json({ message: 'Mời thành viên thành công', newMember });
  } catch (error) {
    logger.error(`Lỗi khi mời thành viên vào group ${group_id}: ${error.message}`);
    res.status(500).json({ message: 'Lỗi khi mời thành viên vào nhóm' });
  }
};

module.exports = { createNewGroup, getUserGroups, inviteMember };
