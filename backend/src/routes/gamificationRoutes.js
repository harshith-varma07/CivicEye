const express = require('express');
const {
  getLeaderboard,
  getBadges,
  getUserStats,
  claimReward,
} = require('../controllers/gamificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/badges', protect, getBadges);
router.get('/stats/:userId?', protect, getUserStats);
router.post('/claim-reward', protect, claimReward);

module.exports = router;
