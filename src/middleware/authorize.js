const pool = require('../config/db');
const logger = require('../utils/logger');

const authorize = (roles = []) => {
    return async (req, res, next) => {
        try {
            const groupId = req.params.groupId || req.body.groupId;

            if (!groupId) {
                return res.status(400).json({ message: 'Group ID is missing' });
            }

            const userRoleQuery = await pool.query(
                'SELECT role FROM user_groups WHERE user_id = $1 AND group_id = $2 AND is_deleted = false',
                [req.user.user_id, groupId]
            );

            if (userRoleQuery.rowCount === 0 || !roles.includes(userRoleQuery.rows[0].role)) {
                logger.warn(`Access denied for user ${req.user.user_id} on group ${groupId}`);
                return res.status(403).json({ message: 'Access denied' });
            }

            logger.info(`User ${req.user.user_id} authorized with role ${userRoleQuery.rows[0].role} for group ${groupId}`);
            next();
        } catch (error) {
            logger.error(`Authorization error: ${error.message}`);
            res.status(500).json({ message: 'Authorization failed', error: error.message });
        }
    };
};

module.exports = authorize;
