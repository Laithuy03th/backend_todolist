const pool = require('../config/db');

// Tạo thông báo mới (có thể kèm theo group_id)
const createNotification = async (userId, groupId, message) => {
    try {
        const query = `
            INSERT INTO notifications (user_id, group_id, message, is_read, created_at)
            VALUES ($1, $2, $3, false, NOW())
        `;
        await pool.query(query, [userId, groupId, message]);
    } catch (error) {
        throw new Error(`Error creating notification: ${error.message}`);
    }
};

// Lấy thông báo theo user_id
const getNotificationsByUserId = async (userId) => {
    try {
        const query = `
            SELECT * 
            FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    } catch (error) {
        throw new Error(`Error retrieving notifications: ${error.message}`);
    }
};

// Đánh dấu tất cả thông báo là đã đọc
const markNotificationsAsRead = async (userId) => {
    try {
        const query = `
            UPDATE notifications 
            SET is_read = true 
            WHERE user_id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rowCount; // Số lượng thông báo được đánh dấu
    } catch (error) {
        throw new Error(`Error marking notifications as read: ${error.message}`);
    }
};

module.exports = {
    createNotification,
    getNotificationsByUserId,
    markNotificationsAsRead,
};
