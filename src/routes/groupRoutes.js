const express = require('express');
const router = express.Router();
const { createNewGroup, getUserGroups, joinGroup } = require('../controllers/groupController');
const authenticate = require('../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: API for managing groups
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
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authenticate,
  [
    check('name', 'Tên nhóm là bắt buộc').not().isEmpty(),
    // Description is optional
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createNewGroup
);

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all groups of the authenticated user
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, getUserGroups);

/**
 * @swagger
 * /api/groups/join:
 *   post:
 *     summary: Join a group
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
 *               - group_id
 *               - role
 *             properties:
 *               group_id:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [member, admin]
 *     responses:
 *       201:
 *         description: Joined group successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post(
  '/join',
  authenticate,
  [
    check('group_id', 'group_id là bắt buộc').isInt(),
    check('role', 'Role phải là "member" hoặc "admin"').isIn(['member', 'admin']),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  joinGroup
);

module.exports = router;
