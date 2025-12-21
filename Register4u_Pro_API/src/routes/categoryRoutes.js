const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Get all categories
router.get('/', authenticate, categoryController.getAllCategories);

// Get category by ID
router.get('/:id', authenticate, categoryController.getCategoryById);

// Create category
router.post('/', [
  authenticate,
  body('name').notEmpty().withMessage('Name is required'),
  validate
], categoryController.createCategory);

// Update category
router.put('/:id', authenticate, categoryController.updateCategory);

// Delete category
router.delete('/:id', authenticate, categoryController.deleteCategory);

module.exports = router;

