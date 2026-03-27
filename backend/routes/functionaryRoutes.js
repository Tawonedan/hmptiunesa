const express = require('express');
const router = express.Router();
const functionaryController = require('../controllers/functionaryController');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');

// Routes GET
router.get('/', functionaryController.getAllFunctionaries);
router.get('/active', functionaryController.getActiveFunctionaries);
router.get('/period/:period', functionaryController.getFunctionariesByPeriod);
router.get('/department/:department', functionaryController.getFunctionariesByDepartment);
router.get('/:id', functionaryController.getFunctionaryById);

// Routes POST
router.post('/', uploadSingle('photo'), handleUploadError, functionaryController.createFunctionary);

// Routes PUT
router.put('/:id', uploadSingle('photo'), handleUploadError, functionaryController.updateFunctionary);

// Routes DELETE
router.delete('/:id', functionaryController.deleteFunctionary);

module.exports = router; 