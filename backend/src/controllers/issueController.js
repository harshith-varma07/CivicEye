const Issue = require('../models/Issue');
const User = require('../models/User');
const { sendNotification } = require('../utils/notification');
const { getFromCache, setToCache, deleteCachePattern } = require('../utils/cache');
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
      department,
      location,
      media,
    } = req.body;

    // Validate that user role is 'user'
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can create issues' });
    }

    // Check if user is rejected
    if (req.user.accountStatus === 'rejected') {
      return res.status(403).json({ message: 'Cannot create issues. Your account was rejected.' });
    }

    // Create issue
    const issue = await Issue.create({
      title,
      description,
      category,
      department,
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
            similarity: aiResponse.data.similarity,
            priority: aiResponse.data.priority,
            priorityScore: aiResponse.data.priorityScore,
            estimatedResolutionTime: aiResponse.data.estimatedResolutionTime,
            predictedAt: new Date(),
          };
          issue.tags = aiResponse.data.tags || [];
          
          // Update issue priority with AI prediction
          if (aiResponse.data.priority) {
            issue.priority = aiResponse.data.priority;
          }
          
          await issue.save();
        }
      } catch (aiError) {
        console.error('AI service error:', aiError.message);
      }
    }

    // Notify officers in the department and pincode
    const officers = await User.find({
      role: 'officer',
      department: department,
      pincode: location.pincode,
    });

    for (const officer of officers) {
      await sendNotification(
        officer._id,
        'New Issue Reported',
        `New ${category} issue in your area: ${title}`,
        'new_issue',
        { issueId: issue._id }
      );
    }

    // Clear cache
    await deleteCachePattern('issues:*');

    const populatedIssue = await Issue.findById(issue._id).populate('reportedBy', 'name aadharNumber avatar');

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
      department,
      pincode,
      page = 1,
      limit = 20,
    } = req.query;

    // Build cache key
    const cacheKey = `issues:${JSON.stringify(req.query)}:${req.user ? req.user._id : 'public'}`;
    const cachedData = await getFromCache(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    // Build query
    const query = {};

    // Filter by officer's department and pincode if user is an officer
    // Officers can ONLY see issues in their department AND their pincode
    if (req.user && req.user.role === 'officer') {
      if (!req.user.department) {
        return res.status(403).json({ message: 'Officer must have a department assigned' });
      }
      if (!req.user.pincode) {
        return res.status(403).json({ message: 'Officer must have a pincode assigned' });
      }
      query.department = req.user.department;
      query['location.pincode'] = req.user.pincode;
    }

    // Filter by pincode for regular users (citizens)
    if (req.user && req.user.role === 'user') {
      if (req.user.pincode) {
        query['location.pincode'] = req.user.pincode;
      }
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (department) query.department = department;

    // Filter by pincode (for neighborhood/area-based searches)
    // Only apply this filter if not already filtered by user's pincode
    if (pincode && !(req.user && (req.user.role === 'officer' || req.user.role === 'user'))) {
      query['location.pincode'] = pincode;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name aadharNumber avatar civicCredits')
      .populate('assignedTo', 'name officerId department')
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

    // Check if user has access to this issue based on pincode
    if (req.user) {
      // Officers can only view issues in their department AND pincode
      if (req.user.role === 'officer') {
        if (!req.user.department || !req.user.pincode) {
          return res.status(403).json({ message: 'Officer must have department and pincode assigned' });
        }
        if (issue.department !== req.user.department) {
          return res.status(403).json({ message: 'Access denied. This issue is not in your department.' });
        }
        if (issue.location.pincode !== req.user.pincode) {
          return res.status(403).json({ message: 'Access denied. This issue is not in your pincode area.' });
        }
      }
      
      // Regular users can only view issues in their pincode
      if (req.user.role === 'user') {
        if (req.user.pincode && issue.location.pincode !== req.user.pincode) {
          return res.status(403).json({ message: 'Access denied. This issue is not in your area.' });
        }
      }
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

    // Check if user has access to this issue based on pincode
    if (req.user.role === 'officer') {
      if (!req.user.department || !req.user.pincode) {
        return res.status(403).json({ message: 'Officer must have department and pincode assigned' });
      }
      if (issue.department !== req.user.department) {
        return res.status(403).json({ message: 'Access denied. This issue is not in your department.' });
      }
      if (issue.location.pincode !== req.user.pincode) {
        return res.status(403).json({ message: 'Access denied. This issue is not in your pincode area.' });
      }
    }
    
    if (req.user.role === 'user') {
      if (req.user.pincode && issue.location.pincode !== req.user.pincode) {
        return res.status(403).json({ message: 'Access denied. This issue is not in your area.' });
      }
    }

    // Use Set for O(1) lookup instead of O(n) array.find()
    const userIdStr = req.user._id.toString();
    const upvotedUserIds = new Set(issue.upvotes.map(upvote => upvote.user.toString()));
    
    const alreadyUpvoted = upvotedUserIds.has(userIdStr);

    if (alreadyUpvoted) {
      // Remove upvote - filter is still needed here but we save one iteration
      issue.upvotes = issue.upvotes.filter(
        (upvote) => upvote.user.toString() !== userIdStr
      );
    } else {
      // Add upvote
      issue.upvotes.push({ user: req.user._id });

      // Award 5 credits to the issue reporter for receiving an upvote
      const reporter = await User.findById(issue.reportedBy);
      if (reporter && reporter.role === 'user') {
        await User.findByIdAndUpdate(issue.reportedBy, {
          $inc: { civicCredits: 5 },
        });
      }

      // Notify issue reporter
      if (issue.reportedBy.toString() !== userIdStr) {
        await sendNotification(
          issue.reportedBy,
          'Issue Upvoted',
          `${req.user.name} upvoted your issue: ${issue.title}. You earned 5 CivicCredits!`,
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

    // Check if officer has access to this issue - must match BOTH department AND pincode
    if (req.user.role === 'officer') {
      if (!req.user.department || !req.user.pincode) {
        return res.status(403).json({ message: 'Officer must have department and pincode assigned' });
      }
      if (issue.department !== req.user.department) {
        return res.status(403).json({ message: 'Access denied. This issue is not in your department.' });
      }
      if (issue.location.pincode !== req.user.pincode) {
        return res.status(403).json({ message: 'Access denied. This issue is not in your pincode area.' });
      }
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

    const issue = await Issue.findById(req.params.id).populate('reportedBy');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if officer has access to this issue - must match BOTH department AND pincode
    if (req.user.role === 'officer') {
      if (!req.user.department || !req.user.pincode) {
        return res.status(403).json({ message: 'Officer must have department and pincode assigned' });
      }
      if (issue.department !== req.user.department) {
        return res.status(403).json({ message: 'Access denied. This issue is not in your department.' });
      }
      if (issue.location.pincode !== req.user.pincode) {
        return res.status(403).json({ message: 'Access denied. This issue is not in your pincode area.' });
      }
    }

    const previousStatus = issue.status;
    issue.status = status;

    if (status === 'resolved') {
      // Only award credits if issue wasn't already resolved
      const wasNotResolved = previousStatus !== 'resolved';
      
      issue.resolvedAt = new Date();
      issue.resolutionNotes = resolutionNotes;
      issue.resolutionMedia = resolutionMedia || [];

      // Award 100 credits to the issue reporter when resolved (only once)
      if (wasNotResolved && issue.reportedBy.role === 'user') {
        await User.findByIdAndUpdate(issue.reportedBy._id, {
          $inc: { civicCredits: 100 },
        });
      }

      // Send notification to reporter
      if (wasNotResolved) {
        await sendNotification(
          issue.reportedBy._id,
          'Issue Resolved',
          `Your issue has been resolved: ${issue.title}. You earned 100 CivicCredits!`,
          'resolution',
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

    // Check if user has access to this issue based on pincode
    if (req.user.role === 'officer') {
      if (!req.user.department || !req.user.pincode) {
        return res.status(403).json({ message: 'Officer must have department and pincode assigned' });
      }
      if (issue.department !== req.user.department) {
        return res.status(403).json({ message: 'Access denied. This issue is not in your department.' });
      }
      if (issue.location.pincode !== req.user.pincode) {
        return res.status(403).json({ message: 'Access denied. This issue is not in your pincode area.' });
      }
    }
    
    if (req.user.role === 'user') {
      if (req.user.pincode && issue.location.pincode !== req.user.pincode) {
        return res.status(403).json({ message: 'Access denied. This issue is not in your area.' });
      }
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
    // Build query filter based on user role
    const matchFilter = {};
    
    // Filter by officer's department AND pincode if user is an officer
    if (req.user && req.user.role === 'officer') {
      if (!req.user.department || !req.user.pincode) {
        return res.status(403).json({ message: 'Officer must have department and pincode assigned' });
      }
      matchFilter.department = req.user.department;
      matchFilter['location.pincode'] = req.user.pincode;
    }

    // Use Promise.all for parallel execution of independent queries
    const [totalIssues, statusCounts, issuesByCategory, issuesByPriority] = await Promise.all([
      Issue.countDocuments(matchFilter),
      // Single aggregation for all status counts
      Issue.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Issue.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),
      Issue.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Convert status counts array to object for easier access
    const statusMap = new Map(statusCounts.map(item => [item._id, item.count]));
    
    res.json({
      totalIssues,
      pendingIssues: statusMap.get('pending') || 0,
      resolvedIssues: statusMap.get('resolved') || 0,
      inProgressIssues: statusMap.get('in-progress') || 0,
      issuesByCategory,
      issuesByPriority,
    });
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
};
