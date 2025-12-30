const mongoose = require('mongoose');

const driverAllotmentSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  visitorId: {
    type: String,
    required: true
  },
  visitorName: {
    type: String
  },
  visitorNumber: {
    type: String
  },
  pickupLocation: {
    type: String
  },
  dropLocation: {
    type: String
  },
  pickupDate: {
    type: Date
  },
  pickupTime: {
    type: String
  },
  dropDate: {
    type: Date
  },
  dropTime: {
    type: String
  },
  remarks: {
    type: String
  },
  smsSent: {
    type: Boolean,
    default: false
  },
  whatsappSent: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['assigned', 'on_trip', 'completed', 'cancelled'],
    default: 'assigned'
  },
  tripType: {
    type: String,
    enum: ['pickup', 'drop', 'pickup_drop'],
    default: 'pickup_drop'
  },
  emergencyContact: {
    type: String,
    default: '+91-9999999999' // Admin emergency number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('DriverAllotment', driverAllotmentSchema);