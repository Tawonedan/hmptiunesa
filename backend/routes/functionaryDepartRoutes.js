const express = require('express');
const router = express.Router();
const functionaryDepartController = require('../controllers/functionaryDepartController');

router.get('/', functionaryDepartController.getAllDeparts);
router.post('/', functionaryDepartController.createDepart);

module.exports = router;
