const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/me', protect, userController.getCurrentUser);
router.put('/me', protect, userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);

// Admin routes
router.get('/', protect, adminMiddleware, userController.getAllUsers);
router.put('/:id/role', protect, adminMiddleware, userController.updateUserRole);

module.exports = router;
