const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Employee authentication routes
router.post('/employee-login', authController.employeeLogin);
router.post('/change-password', authenticateToken, authController.changePassword);
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;