const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// Get dashboard statistics
router.get('/', authenticate, dashboardController.getDashboard);

// Get weekly visitors with details for popup
router.get('/weekly-visitors', authenticate, dashboardController.getWeeklyVisitors);

module.exports = router;

