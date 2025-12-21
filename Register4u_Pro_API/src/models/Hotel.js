const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  hotelId: {
    type: String,
    unique: true
  },
  hotelName: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String
  },
  contactNumber: {
    type: String
  },
  hotelAddress: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for 'name' alias
hotelSchema.virtual('name').get(function() {
  return this.hotelName;
});

// Virtual for categories
hotelSchema.virtual('categories', {
  ref: 'HotelCategory',
  localField: '_id',
  foreignField: 'hotelId'
});

// Virtual for allotments
hotelSchema.virtual('allotments', {
  ref: 'RoomAllotment',
  localField: '_id',
  foreignField: 'hotelId'
});

module.exports = mongoose.model('Hotel', hotelSchema);
