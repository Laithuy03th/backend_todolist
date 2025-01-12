const express = require('express');
const router = express.Router();
const {
  createGroupTaskController,
  updateGroupTaskController,
  deleteGroupTaskController,
  getAdminTasksController,
  getMemberTasksController,
  updateTaskStatusController
} = require('../controllers/groupTaskController');
const authenticate = require('../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');
const authorize = require('../middleware/authorize');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Group Tasks
 *   description: API for managing group tasks
 */

/**
 * @swagger
 * /api/group-tasks:
 *   post:
 *     summary: Create a new group task
 *     tags: [Group Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - title
 *               - description
 *               - dueDate
 *               - assignedTo
 *             properties:
 *               groupId:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               assignedTo:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Group task created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  '/',
  authenticate,
  [
    check('groupId', 'Group ID is required').isInt(),
    check('title', 'Title is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('dueDate', 'Due date must be a valid ISO8601 date').optional().isISO8601(),
    check('assignedTo', 'Assigned To must be a valid integer').isInt()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn(`Validation error: ${JSON.stringify(errors.array())}`);
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authorize('admin'), // Ensure only admins can create group tasks
  createGroupTaskController
);

/**
 * @swagger
 * /api/group-tasks/{group_task_id}:
 *   put:
 *     summary: Update a group task
 *     tags: [Group Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the group task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed]
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Bad request
 */
router.put(
  '/:group_task_id',
  authenticate,
  [
    check('groupId', 'Group ID is required').isInt(),
    check('updates.title', 'Title must be a string').optional().isString(),
    check('updates.description', 'Description must be a string').optional().isString(),
    check('updates.dueDate', 'Due date must be a valid ISO8601 date').optional().isISO8601(),
    check('updates.assignedTo', 'Assigned To must be a valid integer').optional().isInt(),
    check('updates.status', 'Status must be a boolean').optional().isBoolean()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn(`Validation error: ${JSON.stringify(errors.array())}`);
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authorize('admin'), // Only admins can update group tasks
  updateGroupTaskController
);

/**
 * @swagger
 * /api/group-tasks/{group_task_id}:
 *   delete:
 *     summary: Delete a group task
 *     tags: [Group Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the group task
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete('/:group_task_id', authenticate, authorize('admin'), deleteGroupTaskController);
/**
 * @swagger
 * /api/group-tasks/{groupId}/admin:
 *   get:
 *     summary: Get all tasks for admin in a specific group
 *     tags: [Group Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the group
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: integer
 *         description: Filter tasks by assigned member ID
 *     responses:
 *       200:
 *         description: List of tasks for admin
 *       400:
 *         description: Bad request
 */
router.get(
  '/:groupId/admin',
  authenticate,
  [check('groupId', 'Group ID is required').isInt()],
  (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          logger.warn(`Validation error: ${JSON.stringify(errors.array())}`);
          return res.status(400).json({ errors: errors.array() });
      }
      next();
  },
  getAdminTasksController
);
/**
 * @swagger
 * /api/group-tasks/{groupId}/member:
 *   get:
 *     summary: Get tasks assigned to a member in a specific group
 *     tags: [Group Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the group
 *     responses:
 *       200:
 *         description: List of tasks assigned to the member
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: No tasks found for this member
 */
router.get(
  '/:groupId/member',
  authenticate, // Middleware xác thực
  [check('groupId', 'Group ID is required').isInt()],
  (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          logger.warn(`Validation error: ${JSON.stringify(errors.array())}`);
          return res.status(400).json({ errors: errors.array() });
      }
      next();
  },
  getMemberTasksController
);


/**
 * @swagger
 * /api/group-tasks/{group_task_id}/status:
 *   patch:
 *     summary: Update task status
 *     tags: [Group Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the group task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *       400:
 *         description: Bad request
 */
router.patch(
  '/:group_task_id/status',
  authenticate,
  [
    check('status', 'Status must be a boolean').isBoolean()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn(`Validation error: ${JSON.stringify(errors.array())}`);
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateTaskStatusController
);
module.exports = router;
