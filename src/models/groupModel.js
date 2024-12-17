const pool = require('../config/db');

const createGroup = async (name, description) => {
  const result = await pool.query(
    'INSERT INTO groups (name, description) VALUES ($1, $2) RETURNING *',
    [name, description]
  );
  return result.rows[0];
};

const getGroupsByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT g.* FROM groups g
     JOIN user_groups ug ON g.group_id = ug.group_id
     WHERE ug.user_id = $1`,
    [userId]
  );
  return result.rows;
};

const checkUserRoleInGroup = async(userId, groupId) =>{
  const result = await pool.query(
    'SELECT role FROM user_groups WHERE user_id = $1 AND group_id = $2',
    [userId, groupId]
  );
  return result.rows[0]?.role || null;
};

const addUserToGroup = async (userId, groupId, role = 'member') => {
  const result = await pool.query(
    'INSERT INTO user_groups (user_id, group_id, role) VALUES ($1, $2, $3) RETURNING *',
    [userId, groupId, role]
  );
  return result.rows[0];
};

module.exports = { createGroup, getGroupsByUserId, addUserToGroup, checkUserRoleInGroup };
