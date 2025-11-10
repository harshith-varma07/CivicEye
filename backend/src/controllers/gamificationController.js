const User = require('../models/User');
const Issue = require('../models/Issue');

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, timeframe = 'all' } = req.query;

    let dateFilter = {};
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    const topUsers = await User.find({ role: 'user' })
      .sort({ civicCredits: -1 })
      .limit(parseInt(limit))
      .select('name email avatar civicCredits badges');

    // Get issue count for each user
    const usersWithStats = await Promise.all(
      topUsers.map(async (user) => {
        const issueCount = await Issue.countDocuments({
          reportedBy: user._id,
          ...dateFilter,
        });

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          civicCredits: user.civicCredits,
          badges: user.badges,
          issuesReported: issueCount,
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user badges
// @route   GET /api/gamification/badges
// @access  Private
const getBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check and award new badges
    const issueCount = await Issue.countDocuments({ reportedBy: user._id });
    const resolvedCount = await Issue.countDocuments({
      reportedBy: user._id,
      status: 'resolved',
    });

    const newBadges = [];

    // First Issue Badge
    if (issueCount >= 1 && !user.badges.find(b => b.name === 'First Issue')) {
      newBadges.push({
        name: 'First Issue',
        earnedAt: new Date(),
        icon: '🎯',
      });
    }

    // Active Reporter Badge
    if (issueCount >= 10 && !user.badges.find(b => b.name === 'Active Reporter')) {
      newBadges.push({
        name: 'Active Reporter',
        earnedAt: new Date(),
        icon: '📢',
      });
    }

    // Super Reporter Badge
    if (issueCount >= 50 && !user.badges.find(b => b.name === 'Super Reporter')) {
      newBadges.push({
        name: 'Super Reporter',
        earnedAt: new Date(),
        icon: '⭐',
      });
    }

    // Problem Solver Badge
    if (resolvedCount >= 5 && !user.badges.find(b => b.name === 'Problem Solver')) {
      newBadges.push({
        name: 'Problem Solver',
        earnedAt: new Date(),
        icon: '✅',
      });
    }

    // Credit Master Badge
    if (user.civicCredits >= 1000 && !user.badges.find(b => b.name === 'Credit Master')) {
      newBadges.push({
        name: 'Credit Master',
        earnedAt: new Date(),
        icon: '💰',
      });
    }

    if (newBadges.length > 0) {
      user.badges.push(...newBadges);
      await user.save();
    }

    res.json({
      badges: user.badges,
      newBadges,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user stats
// @route   GET /api/gamification/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalIssues = await Issue.countDocuments({ reportedBy: userId });
    const resolvedIssues = await Issue.countDocuments({
      reportedBy: userId,
      status: 'resolved',
    });
    const pendingIssues = await Issue.countDocuments({
      reportedBy: userId,
      status: { $in: ['pending', 'verified', 'assigned', 'in-progress'] },
    });

    // Get total upvotes received
    const issuesWithUpvotes = await Issue.find({ reportedBy: userId });
    const totalUpvotes = issuesWithUpvotes.reduce(
      (sum, issue) => sum + issue.upvoteCount,
      0
    );

    res.json({
      civicCredits: user.civicCredits,
      badges: user.badges,
      totalIssues,
      resolvedIssues,
      pendingIssues,
      totalUpvotes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Claim reward
// @route   POST /api/gamification/claim-reward
// @access  Private (User only)
const claimReward = async (req, res) => {
  try {
    const { rewardId, rewardCost } = req.body;

    // Only users can claim rewards
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can claim rewards' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has enough credits
    if (user.civicCredits < rewardCost) {
      return res.status(400).json({ 
        message: 'Insufficient credits',
        required: rewardCost,
        available: user.civicCredits 
      });
    }

    // Deduct credits
    user.civicCredits -= rewardCost;
    await user.save();

    res.json({
      message: 'Reward claimed successfully',
      rewardId,
      creditsDeducted: rewardCost,
      remainingCredits: user.civicCredits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLeaderboard,
  getBadges,
  getUserStats,
  claimReward,
};
