const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true
  },
  StartTime: {
    type: Date,
    default: Date.now
  },
  EndTime: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String
  },
  description: {
    type: String
  },
  orgId: {
    type: String
  },
  organizationId: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for 'name' alias
eventSchema.virtual('name').get(function() {
  return this.eventName;
});

// Virtual for 'date' alias
eventSchema.virtual('date').get(function() {
  return this.StartTime;
});

module.exports = mongoose.model('Event', eventSchema);
