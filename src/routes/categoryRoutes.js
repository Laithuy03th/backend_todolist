const express = require('express');
const router = express.Router();
const { createNewCategory, getCategories, assignCategory } = require('../controllers/categoryController');
const authenticate = require('../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API for managing categories
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authenticate,
  [check('name', 'Tên danh mục là bắt buộc').not().isEmpty()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createNewCategory
);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, getCategories);

/**
 * @swagger
 * /api/categories/assign:
 *   post:
 *     summary: Assign a category to a task
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *               - category_id
 *             properties:
 *               task_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Category assigned to task successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post(
  '/assign',
  authenticate,
  [
    check('task_id', 'task_id là bắt buộc').isInt(),
    check('category_id', 'category_id là bắt buộc').isInt(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  assignCategory
);

module.exports = router;
