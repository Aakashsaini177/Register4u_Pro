const mongoose = require('mongoose');

const roomAllotmentSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelRoom',
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
  occupancy: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  checkInDate: {
    type: Date
  },
  checkOutDate: {
    type: Date
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
    enum: ['booked', 'checked-in', 'checked-out', 'cancelled'],
    default: 'booked'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('RoomAllotment', roomAllotmentSchema);
