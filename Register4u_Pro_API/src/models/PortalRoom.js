const mongoose = require('mongoose');

const portalRoomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelCategory',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  price: {
    type: Number,
    min: 0
  },
  amenities: {
    type: String
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
  currentGuest: {
    type: String
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure unique room numbers per hotel
portalRoomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('PortalRoom', portalRoomSchema);