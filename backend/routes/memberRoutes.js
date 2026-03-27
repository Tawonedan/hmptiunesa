const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');

// Routes GET
router.get('/', memberController.getAllMembers);
router.get('/search', memberController.searchMembers);
router.get('/active', memberController.getActiveMembers);
router.get('/batch/:batch', memberController.getMembersByBatch);
router.get('/department/:department', memberController.getMembersByDepartment);
router.get('/:id', memberController.getMemberById);

// Routes POST
router.post('/', uploadSingle('photo'), handleUploadError, memberController.createMember);

// Routes PUT
router.put('/:id', uploadSingle('photo'), handleUploadError, memberController.updateMember);

// Routes DELETE
router.delete('/:id', memberController.deleteMember);

module.exports = router; 