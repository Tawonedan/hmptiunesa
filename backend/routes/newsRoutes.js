const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);
router.get('/category/:category', newsController.getNewsByCategory);

// Protected routes
router.post('/', protect, newsController.createNews);
router.put('/:id', protect, newsController.updateNews);
router.delete('/:id', protect, newsController.deleteNews);

module.exports = router; 