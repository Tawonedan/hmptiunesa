const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', galleryController.getAllGalleryItems);
router.get('/featured', galleryController.getFeaturedItems);
router.get('/:id', galleryController.getGalleryItemById);

// Protected routes
router.post('/', protect, galleryController.createGalleryItem);
router.put('/:id', protect, galleryController.updateGalleryItem);
router.delete('/:id', protect, galleryController.deleteGalleryItem);

// Admin routes
router.put('/:id/featured', protect, adminMiddleware, galleryController.toggleFeatured);

module.exports = router; 