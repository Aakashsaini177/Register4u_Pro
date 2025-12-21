const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const organizationController = require('../controllers/organizationController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Get all organizations
router.get('/', authenticate, organizationController.getAllOrganizations);

// Get organization by ID
router.get('/:id', authenticate, organizationController.getOrganizationById);

// Create organization
router.post('/', [
  authenticate,
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  validate
], organizationController.createOrganization);

// Update organization
router.put('/:id', authenticate, organizationController.updateOrganization);

// Delete organization
router.delete('/:id', authenticate, organizationController.deleteOrganization);

module.exports = router;

