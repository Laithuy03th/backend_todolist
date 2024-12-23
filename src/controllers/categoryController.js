const { validationResult } = require('express-validator');
const {
  createCategory,
  getCategoriesByUser,
  getTasksByCategory,
  updateCategory,
  deleteCategory
} = require('../models/categoryModel');
const logger = require('../utils/logger');

// Tạo danh mục mới
const addCategoryController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;
  const userId = req.user.user_id;

  try {
    const newCategory = await createCategory(userId, name);
    logger.info(`Category created for user ${userId}: ${newCategory.category_id}`);
    res.status(201).json(newCategory);
  } catch (error) {
    logger.error(`Error creating category for user ${userId}: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách danh mục của người dùng
const getCategoriesController = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const categories = await getCategoriesByUser(userId);
    logger.info(`Categories retrieved for user ${userId}`);
    res.status(200).json(categories);
  } catch (error) {
    logger.error(`Error retrieving categories for user ${userId}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách nhiệm vụ trong danh mục
const getTasksByCategoryController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { categoryId } = req.params;
  const userId = req.user.user_id;

  try {
    const tasks = await getTasksByCategory(categoryId, userId);
    logger.info(`Tasks retrieved for category ${categoryId} by user ${userId}`);
    res.status(200).json(tasks);
  } catch (error) {
    logger.error(`Error retrieving tasks for category ${categoryId} by user ${userId}: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật danh mục
const updateCategoryController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { categoryId } = req.params;
  const { name } = req.body;
  const userId = req.user.user_id;

  try {
    const updatedCategory = await updateCategory(categoryId, userId, name);
    logger.info(`Category updated for user ${userId}: ${categoryId}`);
    res.status(200).json(updatedCategory);
  } catch (error) {
    logger.error(`Error updating category ${categoryId} for user ${userId}: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

// Xóa danh mục (tự động xóa nhiệm vụ liên quan)
const deleteCategoryController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { categoryId } = req.params;
  const userId = req.user.user_id;

  try {
    const deletedCategory = await deleteCategory(categoryId, userId);
    logger.info(`Category deleted for user ${userId}: ${categoryId}`);
    res.status(200).json(deletedCategory);
  } catch (error) {
    logger.error(`Error deleting category ${categoryId} for user ${userId}: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addCategoryController,
  getCategoriesController,
  getTasksByCategoryController,
  updateCategoryController,
  deleteCategoryController
};
