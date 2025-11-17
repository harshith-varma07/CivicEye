const User = require('../models/User');
const Issue = require('../models/Issue');

// @desc    Get community dashboard (city-wide statistics)
// @route   GET /api/gamification/community-dashboard
// @access  Public
const getCommunityDashboard = async (req, res) => {
  try {
    const { timeframe = 'all' } = req.query;

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

    // City-wide statistics
    const [
      totalIssuesReported,
      totalIssuesResolved,
      totalActiveCitizens,
      issuesByCategory,
      issuesByStatus,
      recentResolvedIssues
    ] = await Promise.all([
      Issue.countDocuments(dateFilter),
      Issue.countDocuments({ status: 'resolved', ...dateFilter }),
      User.countDocuments({ role: 'user', ...dateFilter }),
      Issue.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Issue.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Issue.find({ status: 'resolved', ...dateFilter })
        .sort({ resolvedAt: -1 })
        .limit(10)
        .select('title category location resolvedAt')
    ]);

    const resolutionRate = totalIssuesReported > 0 
      ? ((totalIssuesResolved / totalIssuesReported) * 100).toFixed(1)
      : 0;

    res.json({
      cityWideProgress: {
        totalIssuesReported,
        totalIssuesResolved,
        totalActiveCitizens,
        resolutionRate: parseFloat(resolutionRate),
      },
      issuesByCategory,
      issuesByStatus,
      recentResolvedIssues,
      timeframe
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get neighborhood statistics
// @route   GET /api/gamification/neighborhood-stats
// @access  Public
const getNeighborhoodStats = async (req, res) => {
  try {
    const { pincode, timeframe = 'all' } = req.query;

    if (!pincode) {
      return res.status(400).json({ message: 'Pincode is required' });
    }

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

    // Neighborhood-specific statistics
    const [
      issuesInArea,
      resolvedInArea,
      issuesByCategory,
      activeResidents
    ] = await Promise.all([
      Issue.countDocuments({ 'location.pincode': pincode, ...dateFilter }),
      Issue.countDocuments({ 'location.pincode': pincode, status: 'resolved', ...dateFilter }),
      Issue.aggregate([
        { $match: { 'location.pincode': pincode, ...dateFilter } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.countDocuments({ pincode, role: 'user' })
    ]);

    const neighborhoodResolutionRate = issuesInArea > 0
      ? ((resolvedInArea / issuesInArea) * 100).toFixed(1)
      : 0;

    res.json({
      pincode,
      stats: {
        issuesReported: issuesInArea,
        issuesResolved: resolvedInArea,
        resolutionRate: parseFloat(neighborhoodResolutionRate),
        activeResidents,
      },
      issuesByCategory,
      timeframe
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get personal contribution history
// @route   GET /api/gamification/personal-contributions
// @access  Private
const getPersonalContributions = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Personal contribution statistics
    const [
      totalReported,
      resolvedIssues,
      pendingIssues,
      verifiedIssues,
      recentIssues,
      contributionTimeline
    ] = await Promise.all([
      Issue.countDocuments({ reportedBy: userId }),
      Issue.countDocuments({ reportedBy: userId, status: 'resolved' }),
      Issue.countDocuments({ reportedBy: userId, status: { $in: ['pending', 'verified', 'assigned', 'in-progress'] } }),
      Issue.countDocuments({ reportedBy: userId, status: { $in: ['verified', 'assigned', 'in-progress', 'resolved'] } }),
      Issue.find({ reportedBy: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title category status createdAt resolvedAt location'),
      Issue.aggregate([
        { $match: { reportedBy: userId } },
        {
          $group: {
            _id: { 
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    // Calculate community impact
    const communityImpactScore = (resolvedIssues * 10) + (verifiedIssues * 5) + totalReported;

    res.json({
      personalStats: {
        civicAppreciationPoints: user.civicCredits,
        totalIssuesReported: totalReported,
        issuesResolved: resolvedIssues,
        issuesPending: pendingIssues,
        issuesVerified: verifiedIssues,
        communityImpactScore,
      },
      recentContributions: recentIssues,
      contributionTimeline,
      memberSince: user.createdAt,
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
  getCommunityDashboard,
  getNeighborhoodStats,
  getPersonalContributions,
  claimReward,
};
