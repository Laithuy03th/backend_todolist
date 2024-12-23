const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const {
    addCategoryController,
    getCategoriesController,
    getTasksByCategoryController,
    updateCategoryController,
    deleteCategoryController
} = require('../controllers/categoryController');
const authenticate = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API for managing categories and related tasks
 */

/**
 * Middleware để kiểm tra lỗi từ express-validator
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Validation failed: ${JSON.stringify(errors.array())}`);
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

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
 */
router.post(
    '/',
    authenticate,
    [check('name', 'Name is required').not().isEmpty()],
    validate,
    addCategoryController
);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories for the logged-in user
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, getCategoriesController);

/**
 * @swagger
 * /api/categories/{categoryId}/tasks:
 *   get:
 *     summary: Get all tasks for a specific category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the category
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully
 *       400:
 *         description: Bad request
 */
router.get(
    '/:categoryId/tasks',
    authenticate,
    [check('categoryId', 'Category ID must be an integer').isInt()],
    validate,
    getTasksByCategoryController
);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the category to update
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
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Bad request
 */
router.put(
    '/:categoryId',
    authenticate,
    [
        check('categoryId', 'Category ID must be an integer').isInt(),
        check('name', 'Name is required').not().isEmpty()
    ],
    validate,
    updateCategoryController
);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   delete:
 *     summary: Delete a category (and its related tasks)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the category to delete
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete(
    '/:categoryId',
    authenticate,
    [check('categoryId', 'Category ID must be an integer').isInt()],
    validate,
    deleteCategoryController
);

module.exports = router;
