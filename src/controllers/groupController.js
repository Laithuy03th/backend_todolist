const {
  createGroup,
  updateGroup,
  deleteGroup,
  addMemberToGroup,
  removeMemberFromGroup
} = require('../models/groupModel');
const { createNotificationForGroupInvite } = require('./notificationController');
const logger = require('../utils/logger');

// Tạo nhóm mới
const createGroupController = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.user_id; // Lấy từ token

  try {
    const groupId = await createGroup(name, description, userId);
    logger.info(`Group created successfully: groupId=${groupId}, createdBy=${userId}`);
    res.status(201).json({ groupId, message: 'Group created successfully' });
  } catch (error) {
    logger.error(`Error creating group: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Sửa thông tin nhóm
const updateGroupController = async (req, res) => {
  const { groupId } = req.params;
  const { name, description } = req.body;
  const userId = req.user.user_id; // Lấy từ token

  try {
    const updatedGroup = await updateGroup(groupId, userId, name, description);
    logger.info(`Group updated successfully: groupId=${groupId}, updatedBy=${userId}`);
    res.status(200).json({ updatedGroup, message: 'Group updated successfully' });
  } catch (error) {
    logger.error(`Error updating group groupId=${groupId}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Xóa nhóm (xóa mềm)
const deleteGroupController = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.user_id; // Lấy từ token

  try {
    const deletedGroup = await deleteGroup(groupId, userId);
    logger.info(`Group deleted successfully: groupId=${groupId}, deletedBy=${userId}`);
    res.status(200).json({ deletedGroup, message: 'Group deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting group groupId=${groupId}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Thêm thành viên vào nhóm
const addMemberToGroupController = async (req, res) => {
  const { groupId } = req.params;
  const { memberId } = req.body;
  const adminId = req.user.user_id; // Lấy từ token

  try {
    const addedMember = await addMemberToGroup(groupId, adminId, memberId);
    
    // Tạo thông báo cho thành viên được mời
    const message = `Bạn đã được mời vào nhóm ${groupId} bởi Admin ${adminId}`;
    await createNotificationForGroupInvite(memberId, groupId, message); 

    logger.info(`Member added successfully: memberId=${memberId}, groupId=${groupId}, addedBy=${adminId}`);
    res.status(200).json({ addedMember, message: 'Member added successfully' });
  } catch (error) {
    logger.error(`Error adding member memberId=${memberId} to groupId=${groupId}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Xóa thành viên khỏi nhóm
const removeMemberFromGroupController = async (req, res) => {
  const { groupId } = req.params;
  const { memberId } = req.body;
  const adminId = req.user.user_id; // Lấy từ token

  try {
    const removedMember = await removeMemberFromGroup(groupId, adminId, memberId);
    logger.info(`Member removed successfully: memberId=${memberId}, groupId=${groupId}, removedBy=${adminId}`);
    res.status(200).json({ removedMember, message: 'Member removed successfully' });
  } catch (error) {
    logger.error(`Error removing member memberId=${memberId} from groupId=${groupId}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroupController,
  updateGroupController,
  deleteGroupController,
  addMemberToGroupController,
  removeMemberFromGroupController
};
