const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  driverId: {
    type: String,
    unique: true
  },
  driverName: {
    type: String,
    required: true
  },
  vehicleNumber: {
    type: String
  },
  contactNumber: {
    type: String
  },
  secondaryContactNumber: {
    type: String
  },
  seater: {
    type: Number,
    default: 4
  },
  vehicleType: {
    type: String
  },
  driverPhoto: {
    type: String
  },
  aadharCard: {
    type: String
  },
  licensePhoto: {
    type: String
  },
  rcPhoto: {
    type: String
  },
  isEmployee: {
    type: Boolean,
    default: false
  },
  remarks: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'available', 'on_trip', 'offline'],
    default: 'available'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for 'name' alias
driverSchema.virtual('name').get(function() {
  return this.driverName;
});

// Virtual for 'phone' alias
driverSchema.virtual('phone').get(function() {
  return this.contactNumber;
});

// Virtual for allotments
driverSchema.virtual('allotments', {
  ref: 'DriverAllotment',
  localField: '_id',
  foreignField: 'driverId'
});

module.exports = mongoose.model('Driver', driverSchema);
