const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// Get dashboard statistics
router.get('/', authenticate, dashboardController.getDashboard);

module.exports = router;

