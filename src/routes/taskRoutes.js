const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const {
    addTaskController,
    getUserTasksController,
    updateTaskController,
    deleteTaskController
} = require('../controllers/taskController');
const authenticate = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: API for managing personal tasks
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Add a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - dueDate
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: boolean
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Bad request
 */
router.post(
    '/',
    authenticate,
    [
        check('title', 'Title is required').notEmpty(),
        check('description', 'Description is required').notEmpty(),
        check('dueDate', 'Invalid date format').optional().isISO8601(),
        check('categoryId', 'Category ID must be an integer').optional().isInt(),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    addTaskController
);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *         description: Filter tasks by status (true for completed, false for incomplete)
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, getUserTasksController);

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: boolean
 *               categoryId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Bad request
 */
router.put(
    '/:taskId',
    authenticate,
    [
        check('title', 'Title is required').optional().notEmpty(),
        check('description', 'Description is required').optional().notEmpty(),
        check('due_date', 'Invalid date format').optional().isISO8601(),
        check('status', 'Status must be boolean').optional(),
        check('categoryId', 'Category ID must be an integer').optional().isInt(),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Chuẩn hóa `status` tại đây
        if (req.body.status !== undefined) {
            req.body.status = req.body.status === true || req.body.status === 'true';
        }

        next();
    },
    updateTaskController
);


/**
 * @swagger
 * /api/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task (soft delete)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the task to delete
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete('/:taskId', authenticate, deleteTaskController);

module.exports = router;
