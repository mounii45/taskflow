const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deactivateUser, promoteUser, getAdminStats } = require('../../controllers/user.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate.middleware');

router.use(protect);

const updateUserValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 chars'),
  body('email').optional().trim().isEmail().withMessage('Invalid email').normalizeEmail(),
];

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (admin only for most operations)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [user, admin] }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden
 */
router.get('/', authorize('admin'), getAllUsers);

/**
 * @swagger
 * /users/admin/stats:
 *   get:
 *     summary: Get platform-wide statistics (admin only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User and task statistics
 */
router.get('/admin/stats', authorize('admin'), getAdminStats);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User data
 */
router.get('/:id', authorize('admin'), getUserById);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch('/:id', updateUserValidator, validate, updateUser);

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a user (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deactivated
 */
router.patch('/:id/deactivate', authorize('admin'), deactivateUser);

/**
 * @swagger
 * /users/{id}/promote:
 *   patch:
 *     summary: Promote user to admin (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User promoted to admin
 */
router.patch('/:id/promote', authorize('admin'), promoteUser);

module.exports = router;
