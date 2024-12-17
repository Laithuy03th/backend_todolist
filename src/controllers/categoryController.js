const { createCategory, getAllCategories, assignCategoryToTask } = require('../models/categoryModel');
const logger = require('../utils/logger');

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

const getCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    logger.error(`Error fetching categories: ${error.message}`);
    res.status(500).json({ message: 'Error lấy danh mục' });
  }
};

const assignCategory = async (req, res) => {
  const { task_id, category_id } = req.body;

  try {
    const assignment = await assignCategoryToTask(task_id, category_id);
    logger.info(`Category ${category_id} assigned to task ${task_id}`);
    res.status(201).json(assignment);
  } catch (error) {
    logger.error(`Error assigning category ${category_id} to task ${task_id}: ${error.message}`);
    res.status(500).json({ message: 'Error gán danh mục cho nhiệm vụ' });
  }
};

module.exports = { createNewCategory, getCategories, assignCategory };
