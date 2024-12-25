const pool = require('../config/db');
const { createNotification } = require('./notificationModel');

// Tạo nhóm mới
const createGroup = async (name, description, userId) => {
    try {
        // Tạo nhóm mới
        const groupResult = await pool.query(
            `INSERT INTO groups (name, description, created_at) 
             VALUES ($1, $2, CURRENT_TIMESTAMP) 
             RETURNING group_id`,
            [name, description]
        );
        const groupId = groupResult.rows[0].group_id;

        // Gắn admin đầu tiên vào nhóm
        await pool.query(
            `INSERT INTO user_groups (user_id, group_id, role, created_at) 
             VALUES ($1, $2, 'admin', CURRENT_TIMESTAMP)`,
            [userId, groupId]
        );

        return { groupId, message: 'Group created successfully' };
    } catch (error) {
        throw new Error(`Error creating group: ${error.message}`);
    }
};

// Sửa thông tin nhóm
const updateGroup = async (groupId, userId, name, description) => {
    try {
        // Kiểm tra quyền admin
        const adminCheck = await pool.query(
            `SELECT role FROM user_groups 
             WHERE user_id = $1 AND group_id = $2 AND role = 'admin' AND is_deleted = false`,
            [userId, groupId]
        );
        if (adminCheck.rowCount === 0) {
            throw new Error('You do not have permission to update this group');
        }

        const result = await pool.query(
            `UPDATE groups SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE group_id = $3 AND is_deleted = false 
             RETURNING group_id, name, description`,
            [name, description, groupId]
        );

        if (result.rowCount === 0) {
            throw new Error('Group not found or already deleted');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error updating group: ${error.message}`);
    }
};

// Xóa nhóm (xóa mềm)
const deleteGroup = async (groupId, userId) => {
    try {
        // Kiểm tra quyền admin
        const adminCheck = await pool.query(
            `SELECT role FROM user_groups 
             WHERE user_id = $1 AND group_id = $2 AND role = 'admin' AND is_deleted = false`,
            [userId, groupId]
        );
        if (adminCheck.rowCount === 0) {
            throw new Error('You do not have permission to delete this group');
        }

        const result = await pool.query(
            `UPDATE groups SET is_deleted = true, updated_at = CURRENT_TIMESTAMP 
             WHERE group_id = $1 
             RETURNING group_id`,
            [groupId]
        );

        if (result.rowCount === 0) {
            throw new Error('Group not found or already deleted');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error deleting group: ${error.message}`);
    }
};

// Thêm thành viên vào nhóm
const addMemberToGroup = async (groupId, adminId, memberId) => {
    try {
        // Kiểm tra quyền admin
        const adminCheck = await pool.query(
            `SELECT role FROM user_groups 
             WHERE user_id = $1 AND group_id = $2 AND role = 'admin' AND is_deleted = false`,
            [adminId, groupId]
        );
        if (adminCheck.rowCount === 0) {
            throw new Error('You do not have permission to add members to this group');
        }

        // Kiểm tra thành viên đã tồn tại
        const memberCheck = await pool.query(
            `SELECT user_id FROM user_groups 
             WHERE user_id = $1 AND group_id = $2 AND is_deleted = false`,
            [memberId, groupId]
        );
        if (memberCheck.rowCount > 0) {
            throw new Error('User is already a member of this group');
        }

        // Thêm thành viên
        const result = await pool.query(
            `INSERT INTO user_groups (user_id, group_id, role, created_at) 
             VALUES ($1, $2, 'member', CURRENT_TIMESTAMP) 
             RETURNING user_group_id, user_id, group_id, role`,
            [memberId, groupId]
        );

        // Gửi thông báo
        const message = `You have been added to group: ${groupId}`;
        await createNotification(memberId,groupId, message);

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error adding member to group: ${error.message}`);
    }
};

// Xóa thành viên khỏi nhóm
const removeMemberFromGroup = async (groupId, adminId, memberId) => {
    try {
        // Kiểm tra quyền admin
        const adminCheck = await pool.query(
            `SELECT role FROM user_groups 
             WHERE user_id = $1 AND group_id = $2 AND role = 'admin' AND is_deleted = false`,
            [adminId, groupId]
        );
        if (adminCheck.rowCount === 0) {
            throw new Error('You do not have permission to remove members from this group');
        }

        // Không cho phép xóa admin cuối cùng
        const adminCount = await pool.query(
            `SELECT COUNT(*) AS admin_count 
             FROM user_groups 
             WHERE group_id = $1 AND role = 'admin' AND is_deleted = false`,
            [groupId]
        );
        if (adminCount.rows[0].admin_count === 1 && memberId === adminId) {
            throw new Error('Cannot remove the last admin of the group');
        }

        // Xóa thành viên (xóa mềm)
        const result = await pool.query(
            `UPDATE user_groups SET is_deleted = true
             WHERE user_id = $1 AND group_id = $2 
             RETURNING user_group_id, user_id, group_id`,
            [memberId, groupId]
        );

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error removing member from group: ${error.message}`);
    }
};

module.exports = {
    createGroup,
    updateGroup,
    deleteGroup,
    addMemberToGroup,
    removeMemberFromGroup,
};
