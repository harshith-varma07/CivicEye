const Issue = require('../models/Issue');
const User = require('../models/User');
const { sendNotification } = require('../utils/notification');
const { getFromCache, setToCache, deleteFromCache, deleteCachePattern } = require('../utils/cache');
const axios = require('axios');

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      media,
    } = req.body;

    // Create issue
    const issue = await Issue.create({
      title,
      description,
      category,
      location,
      media: media || [],
      reportedBy: req.user._id,
    });

    // Call AI service for tagging and duplicate detection
    if (process.env.AI_SERVICE_URL) {
      try {
        const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/api/ai/analyze-issue`, {
          issueId: issue._id,
          title: issue.title,
          description: issue.description,
          category: issue.category,
          location: issue.location,
        });

        if (aiResponse.data) {
          issue.aiPrediction = {
            category: aiResponse.data.predictedCategory,
            confidence: aiResponse.data.confidence,
            isDuplicate: aiResponse.data.isDuplicate,
            duplicateOf: aiResponse.data.duplicateOf,
            estimatedResolutionTime: aiResponse.data.estimatedResolutionTime,
            predictedAt: new Date(),
          };
          issue.tags = aiResponse.data.tags || [];
          await issue.save();
        }
      } catch (aiError) {
        console.error('AI service error:', aiError.message);
      }
    }

    // Award civic credits to reporter
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { civicCredits: 10 },
    });

    // Clear cache
    await deleteCachePattern('issues:*');

    const populatedIssue = await Issue.findById(issue._id).populate('reportedBy', 'name email avatar');

    res.status(201).json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all issues with filters
// @route   GET /api/issues
// @access  Public
const getIssues = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      latitude,
      longitude,
      radius,
      page = 1,
      limit = 20,
    } = req.query;

    // Build cache key
    const cacheKey = `issues:${JSON.stringify(req.query)}`;
    const cachedData = await getFromCache(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    // Build query
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Geospatial query
    if (latitude && longitude && radius) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
        },
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email avatar civicCredits')
      .populate('assignedTo', 'name email department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Issue.countDocuments(query);

    const result = {
      issues,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalIssues: total,
    };

    // Cache the result
    await setToCache(cacheKey, result, 600); // 10 minutes

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email avatar civicCredits')
      .populate('assignedTo', 'name email department')
      .populate('upvotes.user', 'name avatar')
      .populate('verifications.user', 'name avatar')
      .populate('comments.user', 'name avatar');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote issue
// @route   PUT /api/issues/:id/upvote
// @access  Private
const upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if already upvoted
    const alreadyUpvoted = issue.upvotes.find(
      (upvote) => upvote.user.toString() === req.user._id.toString()
    );

    if (alreadyUpvoted) {
      // Remove upvote
      issue.upvotes = issue.upvotes.filter(
        (upvote) => upvote.user.toString() !== req.user._id.toString()
      );
    } else {
      // Add upvote
      issue.upvotes.push({ user: req.user._id });

      // Award civic credits
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { civicCredits: 2 },
      });

      // Notify issue reporter
      if (issue.reportedBy.toString() !== req.user._id.toString()) {
        await sendNotification(
          issue.reportedBy,
          'Issue Upvoted',
          `${req.user.name} upvoted your issue: ${issue.title}`,
          'upvote',
          { issueId: issue._id }
        );
      }
    }

    await issue.save();

    // Clear cache
    await deleteCachePattern('issues:*');

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign issue to authority
// @route   PUT /api/issues/:id/assign
// @access  Private (Admin/Authority)
const assignIssue = async (req, res) => {
  try {
    const { authorityId, slaDeadline } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const authority = await User.findById(authorityId);

    if (!authority || authority.role !== 'authority') {
      return res.status(400).json({ message: 'Invalid authority user' });
    }

    issue.assignedTo = authorityId;
    issue.status = 'assigned';
    issue.slaDeadline = slaDeadline;

    await issue.save();

    // Clear cache
    await deleteCachePattern('issues:*');

    // Send notification to authority
    await sendNotification(
      authorityId,
      'Issue Assigned',
      `You have been assigned a new issue: ${issue.title}`,
      'assignment',
      { issueId: issue._id }
    );

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update issue status
// @route   PUT /api/issues/:id/status
// @access  Private (Authority)
const updateIssueStatus = async (req, res) => {
  try {
    const { status, resolutionNotes, resolutionMedia } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.status = status;

    if (status === 'resolved') {
      issue.resolvedAt = new Date();
      issue.resolutionNotes = resolutionNotes;
      issue.resolutionMedia = resolutionMedia || [];

      // Award bonus credits to reporter
      await User.findByIdAndUpdate(issue.reportedBy, {
        $inc: { civicCredits: 50 },
      });

      // Send notification to reporter
      await sendNotification(
        issue.reportedBy,
        'Issue Resolved',
        `Your issue has been resolved: ${issue.title}`,
        'resolution',
        { issueId: issue._id }
      );
    }

    await issue.save();

    // Clear cache
    await deleteCachePattern('issues:*');

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to issue
// @route   POST /api/issues/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.comments.push({
      user: req.user._id,
      text,
    });

    await issue.save();

    const updatedIssue = await Issue.findById(issue._id)
      .populate('comments.user', 'name avatar');

    res.json(updatedIssue.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get issue analytics
// @route   GET /api/issues/analytics/stats
// @access  Private (Admin/Authority)
const getAnalytics = async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const pendingIssues = await Issue.countDocuments({ status: 'pending' });
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const inProgressIssues = await Issue.countDocuments({ status: 'in-progress' });

    const issuesByCategory = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const issuesByPriority = await Issue.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalIssues,
      pendingIssues,
      resolvedIssues,
      inProgressIssues,
      issuesByCategory,
      issuesByPriority,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get issue hotspots
// @route   GET /api/issues/analytics/hotspots
// @access  Public
const getHotspots = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const hotspots = await Issue.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: 'distance',
          maxDistance: parseFloat(radius) * 1000,
          spherical: true,
        },
      },
      {
        $group: {
          _id: {
            category: '$category',
            location: '$location.address',
          },
          count: { $sum: 1 },
          issues: { $push: '$_id' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json(hotspots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssue,
  upvoteIssue,
  assignIssue,
  updateIssueStatus,
  addComment,
  getAnalytics,
  getHotspots,
};
