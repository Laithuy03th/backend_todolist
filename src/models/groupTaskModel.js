const pool = require('../config/db');

// Thêm nhiệm vụ nhóm
const createGroupTask = async (groupId, adminId, title, description, dueDate, assignedTo) => {
    try {
        // Kiểm tra quyền admin
        const adminCheck = await pool.query(
            `SELECT role FROM user_groups WHERE user_id = $1 AND group_id = $2 AND role = 'admin'`,
            [adminId, groupId]
        );
        if (adminCheck.rowCount === 0) {
            throw new Error('You do not have permission to create tasks in this group');
        }

        // Kiểm tra assignedTo là thành viên của nhóm
        const memberCheck = await pool.query(
            `SELECT user_id FROM user_groups WHERE user_id = $1 AND group_id = $2`,
            [assignedTo, groupId]
        );
        if (memberCheck.rowCount === 0) {
            throw new Error('Assigned user is not a member of this group');
        }

        // Thêm nhiệm vụ nhóm
        const taskResult = await pool.query(
            `INSERT INTO group_tasks (group_id, title, description, due_date, assigned_to, created_by, created_at, status) 
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, false) RETURNING title, description, due_date, assigned_to, created_by, status`,
            [groupId, title, description, dueDate, assignedTo, adminId]
        );

        return taskResult.rows[0];
    } catch (error) {
        throw new Error(`Error creating group task: ${error.message}`);
    }
};

// Cập nhật nhiệm vụ nhóm
const updateGroupTask = async (taskId, adminId, groupId, updates) => {
    try {
        // Kiểm tra quyền admin
        const adminCheck = await pool.query(
            `SELECT role FROM user_groups WHERE user_id = $1 AND group_id = $2 AND role = 'admin'`,
            [adminId, groupId]
        );
        if (adminCheck.rowCount === 0) {
            throw new Error('You do not have permission to update tasks in this group');
        }

         // Chuẩn bị các trường cập nhật
         const allowedFields = ['title', 'description', 'due_date', 'assigned_to', 'status'];
         const setClause = Object.keys(updates)
             .filter(key => allowedFields.includes(key))
             .map((key, index) => `${key} = $${index + 1}`)
             .join(', ');


 
         if (setClause.length === 0) {
             throw new Error('No valid fields provided for update');
         }

        const values = Object.values(updates);

       // Cập nhật nhiệm vụ
       const result = await pool.query(
        `UPDATE group_tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
         WHERE task_id = $${values.length + 1} AND group_id = $${values.length + 2} RETURNING task_id, group_id, title, description, due_date, assigned_to, status, updated_at`,
        [...values, taskId, groupId]
    );



        if (result.rowCount === 0) {
            throw new Error('Task not found or you do not have permission to update it');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error updating group task: ${error.message}`);
    }
};

// Xóa nhiệm vụ nhóm
const deleteGroupTask = async (taskId, adminId, groupId) => {
    try {
        // Kiểm tra quyền admin
        const adminCheck = await pool.query(
            `SELECT role FROM user_groups WHERE user_id = $1 AND group_id = $2 AND role = 'admin'`,
            [adminId, groupId]
        );
        if (adminCheck.rowCount === 0) {
            throw new Error('You do not have permission to delete tasks in this group');
        }

        const result = await pool.query(
            `DELETE FROM group_tasks WHERE task_id = $1 AND group_id = $2 RETURNING task_id`,
            [taskId, groupId]
        );

        if (result.rowCount === 0) {
            throw new Error('Task not found or already deleted');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error deleting group task: ${error.message}`);
    }
};
const getAdminTasks = async (groupId, adminId, memberId = null) => {
    try {
        // Kiểm tra quyền admin
        const roleCheck = await pool.query(
            `SELECT role FROM user_groups WHERE user_id = $1 AND group_id = $2 AND role = 'admin' AND is_deleted = false`,
            [adminId, groupId]
        );

        if (roleCheck.rowCount === 0) {
            throw new Error('You do not have permission to view tasks in this group');
        }

        let query = `
            SELECT task_id, title, description, due_date, assigned_to, created_by, created_at, status 
            FROM group_tasks 
            WHERE group_id = $1 AND is_deleted = false
        `;
        const values = [groupId];

        if (memberId) {
            query += ` AND assigned_to = $2`;
            values.push(memberId);
        }

        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        throw new Error(`Error fetching tasks for admin: ${error.message}`);
    }
};


// Lấy danh sách nhiệm vụ dành cho member
const getMemberTasks = async (groupId, memberId) => {
    try {
        logger.info(`Model: Fetching tasks for groupId = ${groupId}, memberId = ${memberId}`);

        // Kiểm tra user là thành viên của nhóm
        const roleCheck = await pool.query(
            `SELECT role FROM user_groups WHERE user_id = $1 AND group_id = $2 AND is_deleted = false`,
            [memberId, groupId]
        );

        logger.info(`Model: roleCheck.rowCount = ${roleCheck.rowCount}`);

        if (roleCheck.rowCount === 0) {
            throw new Error('You are not a member of this group');
        }

        // Lấy danh sách nhiệm vụ được giao cho memberId
        const tasksQuery = await pool.query(
            `SELECT task_id, title, description, due_date, assigned_to, created_by, created_at, status 
             FROM group_tasks 
             WHERE group_id = $1 AND assigned_to = $2 AND is_deleted = false`,
            [groupId, memberId]
        );

        logger.info(`Model: tasksQuery.rows = ${JSON.stringify(tasksQuery.rows)}`);
        return tasksQuery.rows;
    } catch (error) {
        logger.error(`Model Error: ${error.message}`);
        throw new Error(`Error fetching tasks for member: ${error.message}`);
    }
};



// Cập nhật trạng thái nhiệm vụ
const updateTaskStatus = async (taskId, userId, status) => {
    try {
        // Kiểm tra user là người được giao nhiệm vụ
        const taskCheck = await pool.query(
            `SELECT assigned_to FROM group_tasks WHERE task_id = $1 AND assigned_to = $2`,
            [taskId, userId]
        );
        if (taskCheck.rowCount === 0) {
            throw new Error('You do not have permission to update this task');
        }

        // Cập nhật trạng thái
        const result = await pool.query(
            `UPDATE group_tasks SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE task_id = $2 RETURNING task_id, status, updated_at`,
            [status, taskId]
        );

        if (result.rowCount === 0) {
            throw new Error('Task not found or update failed');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error updating task status: ${error.message}`);
    }
};

module.exports = {
    createGroupTask,
    updateGroupTask,
    deleteGroupTask,
    getAdminTasks,
    getMemberTasks,
    updateTaskStatus
};
