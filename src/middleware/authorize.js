const pool = require('../config/db');
const logger = require('../utils/logger');

const authorize = (roles = []) => {
    return async (req, res, next) => {
        try {
            const groupId = req.params.groupId || req.body.groupId || req.query.groupId;

            if (!groupId) {
                return res.status(400).json({ message: 'Group ID is missing' });
            }

            // Kiểm tra vai trò người dùng trong nhóm
            const userRoleQuery = await pool.query(
                'SELECT role FROM user_groups WHERE user_id = $1 AND group_id = $2 AND is_deleted = false',
                [req.user.user_id, groupId]
            );

            if (userRoleQuery.rowCount === 0) {
                logger.warn(`User ${req.user.user_id} is not a member of group ${groupId}`);
                return res.status(403).json({ message: 'You are not a member of this group' });
            }

            const userRole = userRoleQuery.rows[0].role;

            // Kiểm tra quyền
            if (!roles.includes(userRole)) {
                logger.warn(`Access denied for user ${req.user.user_id} with role ${userRole} in group ${groupId}`);
                return res.status(403).json({ message: 'Access denied' });
            }

            logger.info(`User ${req.user.user_id} authorized with role ${userRole} for group ${groupId}`);
            next();
        } catch (error) {
            logger.error(`Authorization error: ${error.message}`);
            res.status(500).json({ message: 'Authorization failed', error: error.message });
        }
    };
};

module.exports = authorize;
