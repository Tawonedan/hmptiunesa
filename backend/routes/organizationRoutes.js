const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

// Get organization profile - public
router.get('/', organizationController.getOrganization);

// Update organization - admin only
router.put('/', protect, adminMiddleware, organizationController.updateOrganization);

// Department routes
router.post('/departments', protect, adminMiddleware, organizationController.addDepartment);
router.put('/departments/:id', protect, adminMiddleware, organizationController.updateDepartment);
router.delete('/departments/:id', protect, adminMiddleware, organizationController.deleteDepartment);

module.exports = router;
