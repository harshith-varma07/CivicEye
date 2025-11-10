/**
 * Script to create the first admin account
 * Run this script once to bootstrap the system with an initial admin
 * 
 * Usage: node scripts/createFirstAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
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
      process.exit(0);
    }

    // Admin details
    const adminData = {
      name: 'System Administrator',
      officerId: 'ADMIN001',
      password: 'admin123', // Change this to a secure password
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
    console.log('\n⚠️  IMPORTANT: Please change the default password immediately after first login!');
    console.log('\n🔐 Login Instructions:');
    console.log('   1. Go to the login page');
    console.log('   2. Select "Admin" role');
    console.log('   3. Enter the Admin ID and password above');
    console.log('   4. You can now create more admins and officers\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(createFirstAdmin);
