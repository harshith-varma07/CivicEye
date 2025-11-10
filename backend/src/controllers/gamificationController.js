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

    // Parallel execution of count queries
    const [issueCount, resolvedCount] = await Promise.all([
      Issue.countDocuments({ reportedBy: user._id }),
      Issue.countDocuments({
        reportedBy: user._id,
        status: 'resolved',
      }),
    ]);

    const newBadges = [];
    
    // Use Set for O(1) badge name lookups instead of O(n) array.find()
    const existingBadgeNames = new Set(user.badges.map(b => b.name));

    // Badge definitions with conditions
    const badgeConditions = [
      { name: 'First Issue', condition: issueCount >= 1, icon: '🎯' },
      { name: 'Active Reporter', condition: issueCount >= 10, icon: '📢' },
      { name: 'Super Reporter', condition: issueCount >= 50, icon: '⭐' },
      { name: 'Problem Solver', condition: resolvedCount >= 5, icon: '✅' },
      { name: 'Credit Master', condition: user.civicCredits >= 1000, icon: '💰' },
    ];

    // Check and add new badges efficiently
    for (const badge of badgeConditions) {
      if (badge.condition && !existingBadgeNames.has(badge.name)) {
        newBadges.push({
          name: badge.name,
          earnedAt: new Date(),
          icon: badge.icon,
        });
      }
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

    // Execute all queries in parallel for better performance
    const [totalIssues, resolvedIssues, pendingIssues, upvoteAggregation] = await Promise.all([
      Issue.countDocuments({ reportedBy: userId }),
      Issue.countDocuments({
        reportedBy: userId,
        status: 'resolved',
      }),
      Issue.countDocuments({
        reportedBy: userId,
        status: { $in: ['pending', 'verified', 'assigned', 'in-progress'] },
      }),
      // Use aggregation to calculate total upvotes in a single query
      Issue.aggregate([
        { $match: { reportedBy: userId } },
        { $group: { _id: null, totalUpvotes: { $sum: '$upvoteCount' } } },
      ]),
    ]);

    const totalUpvotes = upvoteAggregation.length > 0 ? upvoteAggregation[0].totalUpvotes : 0;

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
