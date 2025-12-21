const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Get all events
router.post('/', authenticate, eventController.getAllEvents);

// Get event by ID
router.get('/:id', authenticate, eventController.getEventById);

// Create event
router.post('/create', [
  authenticate,
  body('name').notEmpty().withMessage('Name is required'),
  body('date').notEmpty().withMessage('Date is required'),
  validate
], eventController.createEvent);

// Update event
router.put('/:id', authenticate, eventController.updateEvent);

// Delete event
router.delete('/:id', authenticate, eventController.deleteEvent);

module.exports = router;

