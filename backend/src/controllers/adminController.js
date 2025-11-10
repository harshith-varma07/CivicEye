const User = require('../models/User');
const { sendNotification } = require('../utils/notification');

// @desc    Get all pending user registrations
// @route   GET /api/admin/pending-users
// @access  Private (Admin only)
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      role: 'user', 
      accountStatus: 'pending' 
    }).select('-password').sort({ createdAt: -1 });

    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, accountStatus, department } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (accountStatus) query.accountStatus = accountStatus;
    if (department) query.department = department;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve user registration
// @route   PUT /api/admin/approve-user/:id
// @access  Private (Admin only)
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'user') {
      return res.status(400).json({ message: 'Can only approve user accounts' });
    }

    user.accountStatus = 'approved';
    await user.save();

    // Send notification to user
    await sendNotification(
      user._id,
      'Account Approved',
      'Your CivicEye account has been approved. You can now login.',
      'account_approval',
      {}
    );

    res.json({ 
      message: 'User approved successfully',
      user: {
        _id: user._id,
        name: user.name,
        aadharNumber: user.aadharNumber,
        accountStatus: user.accountStatus,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject user registration
// @route   PUT /api/admin/reject-user/:id
// @access  Private (Admin only)
const rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'user') {
      return res.status(400).json({ message: 'Can only reject user accounts' });
    }

    user.accountStatus = 'rejected';
    user.rejectionReason = reason || 'No reason provided';
    await user.save();

    // Send notification to user
    await sendNotification(
      user._id,
      'Account Rejected',
      `Your CivicEye account registration was rejected. Reason: ${user.rejectionReason}`,
      'account_rejection',
      {}
    );

    res.json({ 
      message: 'User rejected successfully',
      user: {
        _id: user._id,
        name: user.name,
        aadharNumber: user.aadharNumber,
        accountStatus: user.accountStatus,
        rejectionReason: user.rejectionReason,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create officer account
// @route   POST /api/admin/create-officer
// @access  Private (Admin only)
const createOfficer = async (req, res) => {
  try {
    const { name, officerId, password, phone, department, pincode } = req.body;

    // Validate required fields
    if (!name || !officerId || !password || !department) {
      return res.status(400).json({ 
        message: 'Name, Officer ID, password, and department are required' 
      });
    }

    // Check if officer ID already exists
    const existingOfficer = await User.findOne({ officerId });
    if (existingOfficer) {
      return res.status(400).json({ message: 'Officer ID already exists' });
    }

    // Create officer
    const officer = await User.create({
      name,
      officerId,
      password,
      phone,
      department,
      pincode,
      role: 'officer',
      accountStatus: 'approved',
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: 'Officer created successfully',
      officer: {
        _id: officer._id,
        name: officer.name,
        officerId: officer.officerId,
        department: officer.department,
        pincode: officer.pincode,
        role: officer.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create admin account
// @route   POST /api/admin/create-admin
// @access  Private (Admin only)
const createAdmin = async (req, res) => {
  try {
    const { name, officerId, password, phone } = req.body;

    // Validate required fields
    if (!name || !officerId || !password) {
      return res.status(400).json({ 
        message: 'Name, Admin ID, and password are required' 
      });
    }

    // Check if admin ID already exists
    const existingAdmin = await User.findOne({ officerId });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin ID already exists' });
    }

    // Create admin
    const admin = await User.create({
      name,
      officerId,
      password,
      phone,
      role: 'admin',
      accountStatus: 'approved',
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        _id: admin._id,
        name: admin.name,
        officerId: admin.officerId,
        role: admin.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update officer/admin account
// @route   PUT /api/admin/update-user/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const { name, phone, department, pincode, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (pincode) user.pincode = pincode;
    if (password) user.password = password;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        officerId: user.officerId,
        department: user.department,
        pincode: user.pincode,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/delete-user/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin account' });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingUsers = await User.countDocuments({ role: 'user', accountStatus: 'pending' });
    const approvedUsers = await User.countDocuments({ role: 'user', accountStatus: 'approved' });
    const rejectedUsers = await User.countDocuments({ role: 'user', accountStatus: 'rejected' });
    const totalOfficers = await User.countDocuments({ role: 'officer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const officersByDepartment = await User.aggregate([
      { $match: { role: 'officer' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalUsers,
      pendingUsers,
      approvedUsers,
      rejectedUsers,
      totalOfficers,
      totalAdmins,
      officersByDepartment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  createOfficer,
  createAdmin,
  updateUser,
  deleteUser,
  getAdminStats,
};
