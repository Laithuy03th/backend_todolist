const {
  createCategory,
  getAllCategories,
  assignCategoryToTask,
} = require('../models/categoryModel');
const { findTaskById } = require('../models/taskModel'); // Thêm hàm để kiểm tra quyền sở hữu task
const logger = require('../utils/logger');

// Tạo danh mục mới
const createNewCategory = async (req, res) => {
  const { name } = req.body;

  try {
    const category = await createCategory(name);
    logger.info(`Category created: ${name}`);
    res.status(201).json(category);
  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    res.status(500).json({ message: 'Error tạo danh mục' });
  }
};

// Lấy tất cả danh mục
const getCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    logger.error(`Error fetching categories: ${error.message}`);
    res.status(500).json({ message: 'Error lấy danh mục' });
  }
};

// Gán danh mục cho nhiệm vụ
const assignCategory = async (req, res) => {
  const userId = req.user; // Lấy user_id từ middleware authenticate
  const { task_id, category_id } = req.body;

  try {
    // Kiểm tra xem nhiệm vụ có thuộc về người dùng không
    const task = await findTaskById(task_id);
    if (!task) {
      logger.warn(`Task ${task_id} không tồn tại`);
      return res.status(404).json({ message: 'Nhiệm vụ không tồn tại' });
    }
    if (task.user_id !== userId) {
      logger.warn(`User ${userId} không có quyền gán danh mục cho task ${task_id}`);
      return res.status(403).json({ message: 'Bạn không có quyền gán danh mục cho nhiệm vụ này' });
    }

    // Gán danh mục
    const assignment = await assignCategoryToTask(task_id, category_id);
    logger.info(`Category ${category_id} assigned to task ${task_id} bởi user ${userId}`);
    res.status(201).json(assignment);
  } catch (error) {
    logger.error(`Error assigning category ${category_id} to task ${task_id}: ${error.message}`);
    res.status(500).json({ message: 'Error gán danh mục cho nhiệm vụ' });
  }
};

module.exports = { createNewCategory, getCategories, assignCategory };
