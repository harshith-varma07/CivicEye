const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  aadharNumber: {
    type: String,
    sparse: true,
    unique: true,
    match: [/^\d{12}$/, 'Aadhar number must be 12 digits'],
  },
  officerId: {
    type: String,
    sparse: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  pincode: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'officer', 'admin'],
    default: 'user',
  },
  accountStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  civicCredits: {
    type: Number,
    default: function() {
      return this.role === 'user' ? 0 : undefined;
    },
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150',
  },
  department: {
    type: String,
    enum: ['roads', 'electricity', 'water', 'sanitation', 'parks', 'building', 'traffic', 'general'],
  },
  fcmToken: {
    type: String, // For push notifications
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  walletAddress: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who created this officer/admin account
  },
  rejectionReason: {
    type: String,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
