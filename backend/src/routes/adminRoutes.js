const express = require('express');
const { body } = require('express-validator');
const {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  createOfficer,
  createAdmin,
  updateUser,
  deleteUser,
  getAdminStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/pending-users', getPendingUsers);
router.get('/users', getAllUsers);
router.put('/approve-user/:id', approveUser);
router.put(
  '/reject-user/:id',
  [
    body('reason').optional().trim(),
    validate,
  ],
  rejectUser
);

// Officer management routes
router.post(
  '/create-officer',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('officerId').trim().notEmpty().withMessage('Officer ID is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('department').isIn(['roads', 'electricity', 'water', 'sanitation', 'parks', 'building', 'traffic', 'general']).withMessage('Valid department is required'),
    body('pincode').optional().trim(),
    body('phone').optional().trim(),
    validate,
  ],
  createOfficer
);

// Admin management routes
router.post(
  '/create-admin',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('officerId').trim().notEmpty().withMessage('Admin ID is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().trim(),
    validate,
  ],
  createAdmin
);

// Update and delete routes
router.put('/update-user/:id', updateUser);
router.delete('/delete-user/:id', deleteUser);

// Statistics
router.get('/stats', getAdminStats);

module.exports = router;
