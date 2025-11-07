const express = require('express');
const { body } = require('express-validator');
const {
  createIssue,
  getIssues,
  getIssue,
  upvoteIssue,
  assignIssue,
  updateIssueStatus,
  addComment,
  getAnalytics,
  getHotspots,
} = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

// Public routes
router.get('/', getIssues);
router.get('/analytics/hotspots', getHotspots);
router.get('/:id', getIssue);

// Protected routes
router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Valid coordinates required'),
    body('location.address').notEmpty().withMessage('Address is required'),
    validate,
  ],
  createIssue
);

router.put('/:id/upvote', protect, upvoteIssue);
router.post('/:id/comments', protect, addComment);

// Authority/Admin routes
router.put('/:id/assign', protect, authorize('authority', 'admin'), assignIssue);
router.put('/:id/status', protect, authorize('authority', 'admin'), updateIssueStatus);
router.get('/analytics/stats', protect, authorize('authority', 'admin'), getAnalytics);

module.exports = router;
