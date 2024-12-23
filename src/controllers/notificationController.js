const { createNotification } = require('../models/notificationModel');
const logger = require('../utils/logger');

// Tạo thông báo
const createNotificationForGroupInvite = async (userId, groupId, message) => {
    try {
        await createNotification(userId, groupId, message);
        logger.info(`Notification created for user ${userId} about group ${groupId}`);
    } catch (error) {
        logger.error(`Error creating notification for user ${userId}: ${error.message}`);
        throw new Error('Lỗi khi tạo thông báo');
    }
};

module.exports = {
    createNotificationForGroupInvite,
};
