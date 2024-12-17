const { createGroup, getGroupsByUserId, addUserToGroup } = require('../models/groupModel');
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

const joinGroup = async (req, res) => {
  const userId = req.user;
  const { group_id, role } = req.body;

  try {
    const membership = await addUserToGroup(userId, group_id, role);
    logger.info(`User ${userId} joined group ${group_id} as ${role}`);
    res.status(201).json(membership);
  } catch (error) {
    logger.error(`Error joining group ${group_id} by user ${userId}: ${error.message}`);
    res.status(500).json({ message: 'Error tham gia nhóm' });
  }
};

module.exports = { createNewGroup, getUserGroups, joinGroup };
