const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const employeeTaskController = require('../controllers/employeeTaskController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Get all tasks
router.get('/', authenticate, employeeTaskController.getAllTasks);

// Get task by ID
router.get('/:id', authenticate, employeeTaskController.getTaskById);

// Create task
router.post('/', [
  authenticate,
  body('taskName').notEmpty().withMessage('Task name is required'),
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  validate
], employeeTaskController.createTask);

// Update task
router.put('/:id', authenticate, employeeTaskController.updateTask);

// Delete task
router.delete('/:id', authenticate, employeeTaskController.deleteTask);

module.exports = router;

