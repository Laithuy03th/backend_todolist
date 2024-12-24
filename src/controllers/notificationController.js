const { createNotification, getNotificationsByUserId, markNotificationsAsRead } = require('../models/notificationModel');
const logger = require('../utils/logger');

// Tạo thông báo
const createNotificationForGroupInvite = async (userId, groupId, message) => {
    try {
        // Kiểm tra các thông tin đầu vào
        if (!userId || !message) {
            throw new Error('Missing required fields: userId or message');
        }

        if (!groupId) {
            logger.warn('Creating notification without groupId');
        }

        await createNotification(userId, groupId, message);
        logger.info(`Notification created for user ${userId} about group ${groupId}`);
    } catch (error) {
        logger.error(`Error creating notification for user ${userId}: ${error.message}`);
        throw new Error('Lỗi khi tạo thông báo');
    }
};

// Lấy danh sách thông báo theo userId
const getNotifications = async (req, res) => {
    const userId = req.user.user_id; // Lấy từ token
    try {
        const notifications = await getNotificationsByUserId(userId);
        logger.info(`Notifications retrieved for user ${userId}`);
        res.status(200).json(notifications);
    } catch (error) {
        logger.error(`Error retrieving notifications for user ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách thông báo' });
    }
};

// Đánh dấu tất cả thông báo là đã đọc
const markNotifications= async (req, res) => {
    const userId = req.user.user_id; // Lấy từ token
    try {
        const updatedCount = await markNotificationsAsRead(userId);
        logger.info(`Marked ${updatedCount} notifications as read for user ${userId}`);
        res.status(200).json({ message: `${updatedCount} notifications marked as read` });
    } catch (error) {
        logger.error(`Error marking notifications as read for user ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Lỗi khi đánh dấu thông báo là đã đọc' });
    }
};

module.exports = {
    createNotificationForGroupInvite,
    getNotifications,
    markNotifications,
};
