const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'pothole',
      'streetlight',
      'garbage',
      'water',
      'sewage',
      'traffic',
      'park',
      'building',
      'other'
    ],
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['roads', 'electricity', 'water', 'sanitation', 'parks', 'building', 'traffic', 'general'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'assigned', 'in-progress', 'resolved', 'rejected'],
    default: 'pending',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required'],
    },
    address: {
      type: String,
      required: true,
    },
    city: String,
    state: String,
    pincode: String,
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    ipfsHash: String,
    cloudinaryId: String,
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    votedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  upvoteCount: {
    type: Number,
    default: 0,
  },
  verifications: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    comment: String,
  }],
  verificationCount: {
    type: Number,
    default: 0,
  },
  aiPrediction: {
    category: String,
    confidence: Number,
    isDuplicate: Boolean,
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
    },
    similarity: Number, // Duplicate similarity score (0-1)
    priority: String, // AI predicted priority
    priorityScore: Number, // Priority confidence score (0-1)
    estimatedResolutionTime: Number, // in days
    predictedAt: Date,
  },
  blockchainTxHash: {
    type: String,
  },
  slaDeadline: {
    type: Date,
  },
  resolvedAt: {
    type: Date,
  },
  resolutionNotes: {
    type: String,
  },
  resolutionMedia: [{
    url: String,
    ipfsHash: String,
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for efficient queries
issueSchema.index({ location: '2dsphere' });
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ reportedBy: 1, createdAt: -1 });
issueSchema.index({ assignedTo: 1, status: 1 });
issueSchema.index({ upvoteCount: -1 });

// Update upvoteCount when upvotes array changes
issueSchema.pre('save', function(next) {
  if (this.isModified('upvotes')) {
    this.upvoteCount = this.upvotes.length;
  }
  if (this.isModified('verifications')) {
    this.verificationCount = this.verifications.length;
  }
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
