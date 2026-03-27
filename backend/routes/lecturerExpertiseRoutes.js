const express = require('express');
const router = express.Router();
const lecturerExpertiseController = require('../controllers/lecturerExpertiseController');

router.get('/', lecturerExpertiseController.getAllExpertise);
router.post('/', lecturerExpertiseController.createExpertise);

module.exports = router;
