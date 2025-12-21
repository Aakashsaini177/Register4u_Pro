const mongoose = require('mongoose');

const hotelCategorySchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  categoryName: {
    type: String,
    required: true
  },
  occupancy: {
    type: Number,
    default: 1
  },
  numberOfRooms: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for rooms
hotelCategorySchema.virtual('rooms', {
  ref: 'HotelRoom',
  localField: '_id',
  foreignField: 'categoryId'
});

module.exports = mongoose.model('HotelCategory', hotelCategorySchema);
