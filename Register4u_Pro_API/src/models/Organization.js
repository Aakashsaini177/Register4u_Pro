const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  state: {
    type: String
  },
  city: {
    type: String
  },
  pincode: {
    type: String
  },
  GSIJN: {
    type: String
  },
  CIN: {
    type: String
  },
  org_type: {
    type: String,
    default: 'General'
  },
  contact: {
    type: String
  },
  email: {
    type: String
  },
  logo: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Organization', organizationSchema);
