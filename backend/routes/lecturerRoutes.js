const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturerController');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');

// Routes GET
router.get('/', lecturerController.getAllLecturers);
router.get('/search', lecturerController.searchLecturers);
router.get('/specialization/:specialization', lecturerController.getLecturersBySpecialization);
router.get('/:id', lecturerController.getLecturerById);

// Routes POST
router.post('/', uploadSingle('photo'), handleUploadError, lecturerController.createLecturer);

// Routes PUT
router.put('/:id', uploadSingle('photo'), handleUploadError, lecturerController.updateLecturer);

// Routes DELETE
router.delete('/:id', lecturerController.deleteLecturer);

module.exports = router; 