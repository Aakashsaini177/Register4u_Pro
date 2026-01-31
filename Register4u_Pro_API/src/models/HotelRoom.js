const mongoose = require('mongoose');

const hotelRoomSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound unique index: Same hotel + same category = unique room number
hotelRoomSchema.index({ hotelId: 1, categoryId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('HotelRoom', hotelRoomSchema);
