const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for 'name' alias
categorySchema.virtual('name').get(function() {
  return this.category;
});

module.exports = mongoose.model('Category', categorySchema);
