const User = require('../models/User');
const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
const generateToken = require('../utils/generateToken');
const { sendNotification } = require('../utils/notification');

// @desc    Register new user (Citizen)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, aadharNumber, password, phone, address, pincode } = req.body;

    // Validate aadhar number format
    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({ message: 'Valid 12-digit Aadhar number is required' });
    }

    // Check if user exists
    const userExists = await User.findOne({ aadharNumber });
    if (userExists) {
      return res.status(400).json({ message: 'User with this Aadhar number already exists' });
    }

    // Create user with pending status
    const user = await User.create({
      name,
      aadharNumber,
      password,
      phone,
      address,
      pincode,
      role: 'user',
      accountStatus: 'pending',
    });

    if (user) {
      res.status(201).json({
        message: 'Registration request submitted successfully. Please wait for admin approval.',
        _id: user._id,
        name: user.name,
        aadharNumber: user.aadharNumber,
        accountStatus: user.accountStatus,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user (role-based)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { loginId, password, role } = req.body;

    let user;
    
    // Find user based on role
    if (role === 'user') {
      // Users login with Aadhar number
      user = await User.findOne({ aadharNumber: loginId, role: 'user' }).select('+password');
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid Aadhar number or password' });
      }

      // Check if account is rejected (pending and approved users can login)
      if (user.accountStatus === 'rejected') {
        return res.status(403).json({ 
          message: `Your account was rejected. Reason: ${user.rejectionReason || 'Not specified'}` 
        });
      }
    } else if (role === 'officer') {
      // Officers login with Officer ID
      user = await User.findOne({ officerId: loginId, role: 'officer' }).select('+password');
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid Officer ID or password' });
      }
    } else if (role === 'admin') {
      // Admins login with Admin ID (using officerId field)
      user = await User.findOne({ officerId: loginId, role: 'admin' }).select('+password');
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid Admin ID or password' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Verify password
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        aadharNumber: user.aadharNumber,
        officerId: user.officerId,
        role: user.role,
        department: user.department,
        pincode: user.pincode,
        accountStatus: user.accountStatus,
        civicCredits: user.civicCredits,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private (Admin only for direct updates)
const updateProfile = async (req, res) => {
  try {
    // Only admins can update profiles directly
    if (req.user.role === 'officer') {
      return res.status(403).json({ message: 'Officers cannot update their own profiles. Please contact admin.' });
    }

    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'Citizens must submit profile update requests for admin approval.' });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.avatar = req.body.avatar || user.avatar;
      user.fcmToken = req.body.fcmToken || user.fcmToken;

      if (req.body.location) {
        user.location = req.body.location;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        civicCredits: updatedUser.civicCredits,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request profile update (for citizens - requires admin approval)
// @route   POST /api/auth/request-profile-update
// @access  Private (User only)
const requestProfileUpdate = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only citizens can submit profile update requests' });
    }

    // Check if there's already a pending request
    const existingRequest = await ProfileUpdateRequest.findOne({
      user: req.user._id,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending profile update request' });
    }

    // Create new profile update request (name and aadhar cannot be changed)
    const updateRequest = await ProfileUpdateRequest.create({
      user: req.user._id,
      requestedChanges: {
        phone: req.body.phone,
        address: req.body.address,
        pincode: req.body.pincode,
      },
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await sendNotification(
        admin._id,
        'Profile Update Request',
        `${req.user.name} has requested to update their profile`,
        'profile_update_request',
        { requestId: updateRequest._id }
      );
    }

    res.status(201).json({
      message: 'Profile update request submitted successfully',
      requestId: updateRequest._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get profile update request status
// @route   GET /api/auth/profile-update-status
// @access  Private (User only)
const getProfileUpdateStatus = async (req, res) => {
  try {
    const pendingRequest = await ProfileUpdateRequest.findOne({
      user: req.user._id,
      status: 'pending',
    });

    if (pendingRequest) {
      return res.json({
        hasPendingRequest: true,
        pendingChanges: pendingRequest.requestedChanges,
        submittedAt: pendingRequest.createdAt,
      });
    }

    res.json({ hasPendingRequest: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  requestProfileUpdate,
  getProfileUpdateStatus,
};
