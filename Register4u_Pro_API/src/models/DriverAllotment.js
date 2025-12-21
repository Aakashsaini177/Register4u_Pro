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
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('DriverAllotment', driverAllotmentSchema);