const express = require('express');
const {
  getCommunityDashboard,
  getNeighborhoodStats,
  getPersonalContributions,
  claimReward,
} = require('../controllers/gamificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/community-dashboard', getCommunityDashboard);
router.get('/neighborhood-stats', getNeighborhoodStats);
router.get('/personal-contributions', protect, getPersonalContributions);
router.post('/claim-reward', protect, claimReward);

module.exports = router;
