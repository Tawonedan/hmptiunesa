const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', eventController.getEvents);
router.get('/categories', eventController.getEventCategories);
router.get('/stats', eventController.getEventStats);
router.get('/:id', eventController.getEventById);

// Protected routes
router.post('/', protect, eventController.createEvent);
router.put('/:id', protect, eventController.updateEvent);
router.delete('/:id', protect, eventController.deleteEvent);

module.exports = router; 