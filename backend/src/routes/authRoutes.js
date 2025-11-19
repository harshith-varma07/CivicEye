const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('aadharNumber').matches(/^\d{12}$/).withMessage('Valid 12-digit Aadhar number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().trim(),
    body('address').optional().trim(),
    body('pincode').optional().trim(),
    validate,
  ],
  register
);

router.post(
  '/login',
  [
    body('loginId').trim().notEmpty().withMessage('Login ID is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['user', 'officer', 'admin']).withMessage('Valid role is required'),
    validate,
  ],
  login
);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/request-profile-update', protect, require('../controllers/authController').requestProfileUpdate);
router.get('/profile-update-status', protect, require('../controllers/authController').getProfileUpdateStatus);

module.exports = router;
