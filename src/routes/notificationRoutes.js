const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markNotificationsAsRead
} = require('../controllers/notificationController');
const authenticate = require('../middleware/authMiddleware'); // Middleware để xác thực người dùng

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API for managing user notifications
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id; // Lấy user_id từ token
        const notifications = await getNotifications(userId);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/notifications/mark-as-read:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/mark-as-read', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id; // Lấy user_id từ token
        const result = await markNotificationsAsRead(userId);
        res.status(200).json({ message: `${result} notifications marked as read` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
