/**
 * Docker initialization script to create the first admin account
 * This script runs inside the Docker container
 * 
 * Usage: node scripts/docker-init-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/civiceye?authSource=admin';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User schema (simplified for this script)
const userSchema = new mongoose.Schema({
  name: String,
  officerId: String,
  password: String,
  phone: String,
  role: String,
  accountStatus: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const createFirstAdmin = async () => {
  try {
    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  An admin account already exists!');
      console.log(`Admin: ${existingAdmin.name} (ID: ${existingAdmin.officerId})`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Admin details
    const adminData = {
      name: 'System Administrator',
      officerId: 'ADMIN001',
      password: 'admin123', // Default password
      phone: '1234567890',
      role: 'admin',
      accountStatus: 'approved',
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin
    const admin = await User.create({
      ...adminData,
      password: hashedPassword,
    });

    console.log('✅ First admin account created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log(`   Admin ID: ${adminData.officerId}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Name: ${adminData.name}`);
    console.log('\n⚠️  IMPORTANT: Please change the default password after first login!');
    console.log('\n🔐 Login Instructions:');
    console.log('   1. Go to http://localhost:3000');
    console.log('   2. Select "Admin" role');
    console.log('   3. Enter the Admin ID and password above');
    console.log('   4. You can now manage users and create officers\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
connectDB().then(createFirstAdmin);
