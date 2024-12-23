const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const {
    createGroupController,
    updateGroupController,
    deleteGroupController,
    addMemberToGroupController,
    removeMemberFromGroupController
} = require('../controllers/groupController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const logger = require('../utils/logger');

/**
 * @route POST /api/groups
 * @desc Tạo nhóm mới
 * @access Private
 */
router.post(
    '/',
    authenticate,
    [
        check('name', 'Group name is required').notEmpty(),
        check('description', 'Description must be a string').optional().isString()
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
 * @route PUT /api/groups/:groupId
 * @desc Sửa thông tin nhóm
 * @access Private (Admin của nhóm)
 */
router.put(
    '/:groupId',
    authenticate,
    authorize('admin'),
    [
        check('name', 'Group name is required').optional().notEmpty(),
        check('description', 'Description must be a string').optional().isString()
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
 * @route DELETE /api/groups/:groupId
 * @desc Xóa nhóm (xóa mềm)
 * @access Private (Admin của nhóm)
 */
router.delete(
    '/:groupId',
    authenticate,
    authorize('admin'),
    deleteGroupController
);

/**
 * @route POST /api/groups/:groupId/members
 * @desc Thêm thành viên vào nhóm
 * @access Private (Admin của nhóm)
 */
router.post(
    '/:groupId/members',
    authenticate,
    authorize('admin'),
    [
        check('memberId', 'Member ID is required').isInt()
    ],
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
 * @route DELETE /api/groups/:groupId/members
 * @desc Xóa thành viên khỏi nhóm
 * @access Private (Admin của nhóm)
 */
router.delete(
    '/:groupId/members',
    authenticate,
    authorize('admin'),
    [
        check('memberId', 'Member ID is required').isInt()
    ],
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
