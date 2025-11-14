const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple User model for seeding
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  aadharNumber: String,
  officerId: String,
  password: String,
  phone: String,
  address: String,
  pincode: String,
  role: String,
  accountStatus: String,
  civicCredits: Number,
  badges: Array,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  avatar: String,
  department: String,
  fcmToken: String,
  isVerified: Boolean,
  walletAddress: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  rejectionReason: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/civiceye?authSource=admin';
  
  console.log('Connecting to MongoDB...');
  console.log('MongoDB URI:', MONGODB_URI);
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ officerId: 'ADMIN001', role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Admin ID: ADMIN001');
      console.log('Password: admin123');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create default admin user
    const admin = await User.create({
      name: 'System Admin',
      officerId: 'ADMIN001',
      password: hashedPassword,
      phone: '9999999999',
      role: 'admin',
      accountStatus: 'approved',
      isVerified: true,
    });

    console.log('✅ Default admin user created successfully!');
    console.log('=========================================');
    console.log('Admin Login Credentials:');
    console.log('Admin ID: ADMIN001');
    console.log('Password: admin123');
    console.log('=========================================');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();
