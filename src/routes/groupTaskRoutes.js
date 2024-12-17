const express = require('express');
const router = express.Router();
const { createNewGroupTask, getAllGroupTasks, modifyGroupTask, removeGroupTask } = require('../controllers/groupTaskController');
const authenticate = require('../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');

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
 *               - task_id
 *               - group_id
 *               - assigned_by
 *             properties:
 *               task_id:
 *                 type: integer
 *               group_id:
 *                 type: integer
 *               assigned_by:
 *                 type: integer
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [pending, completed]
 *     responses:
 *       201:
 *         description: Group task created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authenticate,
  [
    check('task_id', 'task_id là bắt buộc').isInt(),
    check('group_id', 'group_id là bắt buộc').isInt(),
    check('assigned_by', 'assigned_by là bắt buộc').isInt(),
    check('status').optional().isIn(['pending', 'completed']),
    check('due_date').optional().isISO8601(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createNewGroupTask
);

/**
 * @swagger
 * /api/group-tasks/{group_id}:
 *   get:
 *     summary: Get all group tasks for a specific group
 *     tags: [Group Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         description: ID of the group
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of group tasks
 *       500:
 *         description: Server error
 */
router.get('/:group_id', authenticate, getAllGroupTasks);

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
 *         required: true
 *         description: ID of the group task to update
 *         schema:
 *           type: integer
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
 *               due_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Group task updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Group task not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:group_task_id',
  authenticate,
  [
    check('status').optional().isIn(['pending', 'completed']),
    check('due_date').optional().isISO8601(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  modifyGroupTask
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
 *         required: true
 *         description: ID of the group task to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Group task deleted successfully
 *       404:
 *         description: Group task not found
 *       500:
 *         description: Server error
 */
router.delete('/:group_task_id', authenticate, removeGroupTask);

module.exports = router;
