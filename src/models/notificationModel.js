const pool = require('../config/db');

// Tạo thông báo mới
const createNotification = async (userId, message) => {
    const query = `
        INSERT INTO notifications (user_id, message, is_read, created_at)
        VALUES ($1, $2, false, NOW())
    `;
    await pool.query(query, [userId, message]);
};

// Lấy thông báo theo user_id
const getNotificationsByUserId = async (userId) => {
    const query = `
        SELECT * 
        FROM notifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

// Đánh dấu tất cả thông báo là đã đọc
const markNotificationsAsRead = async (userId) => {
    const query = `
        UPDATE notifications 
        SET is_read = true 
        WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rowCount; // Số lượng thông báo được đánh dấu
};

module.exports = {
    createNotification,
    getNotificationsByUserId,
    markNotificationsAsRead,
};
