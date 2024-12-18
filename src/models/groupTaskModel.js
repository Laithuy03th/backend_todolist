const pool = require('../config/db');

const createGroupTask = async (taskId, groupId, assignedBy, dueDate = null, status = 'pending') => {
  const result = await pool.query(
    `INSERT INTO group_tasks (task_id, group_id, assigned_by, due_date, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [taskId, groupId, assignedBy, dueDate, status]
  );
  return result.rows[0];
};

const getGroupTasks = async (groupId) => {
  const result = await pool.query(
    `SELECT gt.*, t.title, t.description, u.username AS assigned_by
     FROM group_tasks gt
     JOIN tasks t ON gt.task_id = t.task_id
     JOIN users u ON gt.assigned_by = u.user_id
     WHERE gt.group_id = $1`,
    [groupId]
  );
  return result.rows;
};

const updateGroupTask = async (groupTaskId, fields, userId) => {
  
  const permissionCheck = await pool.query(
    `SELECT gt.assigned_by, ug.role
     FROM group_tasks gt
     JOIN user_groups ug ON gt.group_id = ug.group_id
     WHERE gt.group_task_id = $1 AND ug.user_id = $2`,
    [groupTaskId, userId]
  );

  const { assigned_by, role } = permissionCheck.rows[0] || {};
  if (!assigned_by) throw new Error('Nhiệm vụ không tồn tại');
  if (assigned_by !== userId && role !== 'admin') throw new Error('Bạn không có quyền cập nhật nhiệm vụ này');


  const setString = Object.keys(fields)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');
  const values = Object.values(fields);

  const result = await pool.query(
    `UPDATE group_tasks SET ${setString}, updated_at = CURRENT_TIMESTAMP WHERE group_task_id = $${values.length + 1} RETURNING *`,
    [...values, groupTaskId]
  );
  return result.rows[0];
};


const deleteGroupTask = async (groupTaskId, userId) => {
  
  const permissionCheck = await pool.query(
    `SELECT gt.assigned_by, ug.role
     FROM group_tasks gt
     JOIN user_groups ug ON gt.group_id = ug.group_id
     WHERE gt.group_task_id = $1 AND ug.user_id = $2`,
    [groupTaskId, userId]
  );

  const { assigned_by, role } = permissionCheck.rows[0] || {};
  if (!assigned_by) throw new Error('Nhiệm vụ không tồn tại');
  if (assigned_by !== userId && role !== 'admin') throw new Error('Bạn không có quyền xóa nhiệm vụ này');

  
  await pool.query('DELETE FROM group_tasks WHERE group_task_id = $1', [groupTaskId]);
};

module.exports = { createGroupTask, getGroupTasks, updateGroupTask, deleteGroupTask };
