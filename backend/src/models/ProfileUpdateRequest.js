const mongoose = require('mongoose');

const profileUpdateRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestedChanges: {
    name: String,
    phone: String,
    address: String,
    pincode: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProfileUpdateRequest', profileUpdateRequestSchema);
