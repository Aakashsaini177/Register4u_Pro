const mongoose = require('mongoose');

const travelDetailSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    unique: true,
    required: true
  },
  visitorName: {
    type: String
  },
  mobileNumber: {
    type: String
  },
  travelBy: {
    type: String
  },
  flightTrainNo: {
    type: String
  },
  fromLocation: {
    type: String
  },
  toLocation: {
    type: String
  },
  arrivalDate: {
    type: Date
  },
  arrivalTime: {
    type: String
  },
  departureDate: {
    type: Date
  },
  departureTime: {
    type: String
  },
  remarks: {
    type: String
  },
  type: {
    type: String,
    enum: ['arrival', 'departure', 'both'],
    default: 'both'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for hotel allotments (RoomAllotment)
travelDetailSchema.virtual('hotelAllotments', {
  ref: 'RoomAllotment',
  localField: 'visitorId',
  foreignField: 'visitorId'
});

// Virtual for driver allotments (DriverAllotment)
travelDetailSchema.virtual('driverAllotments', {
  ref: 'DriverAllotment',
  localField: 'visitorId',
  foreignField: 'visitorId'
});

module.exports = mongoose.model('TravelDetail', travelDetailSchema);
