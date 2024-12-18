const pool = require('../config/db');

// Middleware phân quyền theo role
const authorize = (requiredRoles = []) => {
  return async (req, res, next) => {
    const userId = req.user; // Lấy user_id từ token (đã xác thực)
    const { group_id } = req.body || req.params; // Lấy group_id từ body hoặc params

    try {
      // Kiểm tra vai trò (role) của user trong group
      const result = await pool.query(
        'SELECT role FROM user_groups WHERE user_id = $1 AND group_id = $2',
        [userId, group_id]
      );

      const userRole = result.rows[0]?.role;

      // Nếu không tìm thấy role hoặc không đủ quyền
      if (!userRole) {
        return res.status(403).json({ message: 'Bạn không thuộc nhóm này' });
      }
      if (!requiredRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Bạn không có quyền thực hiện chức năng này' });
      }
      

      next(); // Cho phép tiếp tục nếu đúng role
    } catch (error) {
      console.error(`Error in authorization middleware: ${error.message}`);
      res.status(500).json({ message: 'Lỗi phân quyền' });
    }
  };
};

module.exports = authorize;
