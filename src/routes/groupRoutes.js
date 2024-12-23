const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const {
    createGroupController,
    updateGroupController,
    deleteGroupController,
    addMemberToGroupController,
    removeMemberFromGroupController,
} = require('../controllers/groupController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: API for managing groups and their members
 */

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
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
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Bad request
 */
router.post(
    '/',
    authenticate,
    [
        check('name', 'Group name is required').notEmpty(),
        check('description', 'Description must be a string').optional().isString(),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Validation failed for creating group', { errors: errors.array() });
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    createGroupController
);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   put:
 *     summary: Update a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       400:
 *         description: Bad request
 */
router.put(
    '/:groupId',
    authenticate,
    authorize('admin'),
    [
        check('name', 'Group name is required').optional().notEmpty(),
        check('description', 'Description must be a string').optional().isString(),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Validation failed for updating group', { errors: errors.array() });
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    updateGroupController
);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group to delete
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete('/:groupId', authenticate, authorize('admin'), deleteGroupController);

/**
 * @swagger
 * /api/groups/{groupId}/members:
 *   post:
 *     summary: Add a member to a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *             properties:
 *               memberId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Member added successfully
 *       400:
 *         description: Bad request
 */
router.post(
    '/:groupId/members',
    authenticate,
    authorize('admin'),
    [check('memberId', 'Member ID is required').isInt()],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Validation failed for adding member to group', { errors: errors.array() });
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    addMemberToGroupController
);

/**
 * @swagger
 * /api/groups/{groupId}/members:
 *   delete:
 *     summary: Remove a member from a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *             properties:
 *               memberId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: Bad request
 */
router.delete(
    '/:groupId/members',
    authenticate,
    authorize('admin'),
    [check('memberId', 'Member ID is required').isInt()],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Validation failed for removing member from group', { errors: errors.array() });
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    removeMemberFromGroupController
);

module.exports = router;
