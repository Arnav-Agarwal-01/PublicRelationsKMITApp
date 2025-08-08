/**
 * Messaging System API
 * 
 * Handles messaging operations including:
 * - College-wide broadcasts (PR council only)
 * - Club-specific messaging (club heads and PR council)
 * - Message retrieval with filtering and pagination
 * - Role-based permissions for message sending
 * 
 * Requirements: 7.1, 7.2, 7.5, 9.3, 10.3
 */

const express = require('express');
const Message = require('../models/Message');
const Club = require('../models/Club');
const User = require('../models/User');
const {
  authenticateToken,
  requirePRCouncil,
  requireClubHeadOrPR
} = require('../middleware/auth');

const router = express.Router();

/**
 * Helper function to check if user can send messages to a specific club
 */
const canSendToClub = async (user, clubId) => {
  // PR council can send to any club
  if (user.role === 'pr_council') return true;

  // Club heads can only send to their own club
  if (user.role === 'club_head') {
    const club = await Club.findById(clubId);
    if (!club) return false;
    return club.clubHead.toString() === user.userId;
  }

  return false;
};

/**
 * POST /api/messages
 * Send a broadcast message
 * 
 * Body:
 * - content: string (required) - Message content
 * - targetType: string (required) - 'college_wide' or 'club_specific'
 * - targetId: string (optional) - Club ID for club-specific messages
 * - isUrgent: boolean (optional) - Mark message as urgent
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, targetType, targetId, isUrgent = false } = req.body;

    // Validate required fields
    if (!content || !targetType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Content and targetType are required'
        }
      });
    }

    // Validate targetType
    if (!['college_wide', 'club_specific'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TARGET_TYPE',
          message: 'targetType must be either college_wide or club_specific'
        }
      });
    }

    // Check permissions based on target type
    if (targetType === 'college_wide') {
      // Only PR council can send college-wide messages
      if (req.user.role !== 'pr_council') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Only PR council members can send college-wide messages'
          }
        });
      }
    } else if (targetType === 'club_specific') {
      // Validate targetId for club-specific messages
      if (!targetId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_TARGET_ID',
            message: 'targetId is required for club-specific messages'
          }
        });
      }

      // Check if user can send to this club
      if (!(await canSendToClub(req.user, targetId))) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'You can only send messages to your own club'
          }
        });
      }

      // Verify club exists
      const club = await Club.findById(targetId);
      if (!club) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CLUB_NOT_FOUND',
            message: 'Target club not found'
          }
        });
      }
    }

    // Create the message
    const message = new Message({
      content,
      sender: req.user.userId,
      targetType,
      targetId: targetType === 'club_specific' ? targetId : null,
      isUrgent
    });

    await message.save();

    // Populate sender information for response
    await message.populate('sender', 'name rollNumber clubName role');

    // If club-specific, populate club information
    if (targetType === 'club_specific') {
      await message.populate('targetId', 'name');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: {
          _id: message._id,
          content: message.content,
          sender: message.sender,
          targetType: message.targetType,
          targetClub: message.targetId,
          isUrgent: message.isUrgent,
          createdAt: message.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error sending message'
      }
    });
  }
});

/**
 * GET /api/messages
 * Retrieve messages with filtering and pagination
 * 
 * Query parameters:
 * - type: string (optional) - Filter by 'college_wide' or 'club_specific'
 * - clubId: string (optional) - Filter by specific club ID
 * - page: number (optional, default: 1) - Page number for pagination
 * - limit: number (optional, default: 20) - Number of messages per page
 * - urgent: boolean (optional) - Filter urgent messages only
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      type,
      clubId,
      page = 1,
      limit = 20,
      urgent
    } = req.query;

    // Build filter query
    const filter = {};

    // Filter by message type
    if (type && ['college_wide', 'club_specific'].includes(type)) {
      filter.targetType = type;
    }

    // Filter by club ID
    if (clubId) {
      filter.targetId = clubId;
    }

    // Filter urgent messages
    if (urgent === 'true') {
      filter.isUrgent = true;
    }

    // Build user-specific filter based on role and club membership
    const userFilter = [];

    // All users can see college-wide messages
    userFilter.push({ targetType: 'college_wide' });

    // Add club-specific messages based on user's club memberships
    if (req.user.role === 'student') {
      // Students can see messages from clubs they're members of
      const user = await User.findById(req.user.userId).populate('joinedClubs');
      if (user && user.joinedClubs.length > 0) {
        const clubIds = user.joinedClubs.map(club => club._id);
        userFilter.push({
          targetType: 'club_specific',
          targetId: { $in: clubIds }
        });
      }
    } else if (req.user.role === 'club_head') {
      // Club heads can see messages from their own club
      const club = await Club.findOne({ clubHead: req.user.userId });
      if (club) {
        userFilter.push({
          targetType: 'club_specific',
          targetId: club._id
        });
      }
    } else if (req.user.role === 'pr_council') {
      // PR council can see all messages
      userFilter.push({ targetType: 'club_specific' });
    }

    // Combine filters
    const finalFilter = {
      ...filter,
      $or: userFilter
    };

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 messages per page
    const skip = (pageNum - 1) * limitNum;

    // Get messages with pagination
    const messages = await Message.find(finalFilter)
      .populate('sender', 'name rollNumber clubName role')
      .populate('targetId', 'name')
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination info
    const totalMessages = await Message.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalMessages / limitNum);

    // Format messages for response
    const formattedMessages = messages.map(message => ({
      _id: message._id,
      content: message.content,
      sender: message.sender,
      targetType: message.targetType,
      targetClub: message.targetId,
      isUrgent: message.isUrgent,
      createdAt: message.createdAt,
      readBy: message.readBy.length // Just count, not full array for privacy
    }));

    res.json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages: formattedMessages,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalMessages,
          messagesPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error retrieving messages'
      }
    });
  }
});

/**
 * GET /api/messages/college-wide
 * Get college-wide messages (all users can access)
 */
router.get('/college-wide', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, urgent } = req.query;

    // Build filter
    const filter = { targetType: 'college_wide' };
    if (urgent === 'true') {
      filter.isUrgent = true;
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get messages
    const messages = await Message.find(filter)
      .populate('sender', 'name rollNumber clubName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalMessages = await Message.countDocuments(filter);
    const totalPages = Math.ceil(totalMessages / limitNum);

    res.json({
      success: true,
      message: 'College-wide messages retrieved successfully',
      data: {
        messages: messages.map(msg => ({
          _id: msg._id,
          content: msg.content,
          sender: msg.sender,
          isUrgent: msg.isUrgent,
          createdAt: msg.createdAt
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalMessages,
          messagesPerPage: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving college-wide messages:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error retrieving college-wide messages'
      }
    });
  }
});

/**
 * GET /api/messages/club/:clubId
 * Get messages for a specific club
 */
router.get('/club/:clubId', authenticateToken, async (req, res) => {
  try {
    const { clubId } = req.params;
    const { page = 1, limit = 20, urgent } = req.query;

    // Verify club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CLUB_NOT_FOUND',
          message: 'Club not found'
        }
      });
    }

    // Check if user can access this club's messages
    let canAccess = false;

    if (req.user.role === 'pr_council') {
      canAccess = true;
    } else if (req.user.role === 'club_head') {
      canAccess = club.clubHead.toString() === req.user.userId;
    } else if (req.user.role === 'student') {
      canAccess = club.members.includes(req.user.userId);
    }

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to view this club\'s messages'
        }
      });
    }

    // Build filter
    const filter = {
      targetType: 'club_specific',
      targetId: clubId
    };
    if (urgent === 'true') {
      filter.isUrgent = true;
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get messages
    const messages = await Message.find(filter)
      .populate('sender', 'name rollNumber clubName role')
      .populate('targetId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalMessages = await Message.countDocuments(filter);
    const totalPages = Math.ceil(totalMessages / limitNum);

    res.json({
      success: true,
      message: 'Club messages retrieved successfully',
      data: {
        club: {
          _id: club._id,
          name: club.name
        },
        messages: messages.map(msg => ({
          _id: msg._id,
          content: msg.content,
          sender: msg.sender,
          isUrgent: msg.isUrgent,
          createdAt: msg.createdAt
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalMessages,
          messagesPerPage: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving club messages:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error retrieving club messages'
      }
    });
  }
});

/**
 * PUT /api/messages/:id/mark-read
 * Mark a message as read by the current user
 */
router.put('/:id/mark-read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MESSAGE_NOT_FOUND',
          message: 'Message not found'
        }
      });
    }

    // Check if user already marked as read
    const alreadyRead = message.readBy.some(read => read.userId.toString() === userId);
    if (alreadyRead) {
      return res.json({
        success: true,
        message: 'Message already marked as read',
        data: { messageId: id }
      });
    }

    // Add user to readBy array
    message.readBy.push({
      userId: userId,
      readAt: new Date()
    });

    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read',
      data: {
        messageId: id,
        readAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error marking message as read'
      }
    });
  }
});

/**
 * GET /api/messages/my-clubs
 * Get messages from all clubs the current user is a member of
 */
router.get('/my-clubs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, urgent } = req.query;

    let clubIds = [];

    if (req.user.role === 'student') {
      // Get clubs user is a member of
      const user = await User.findById(req.user.userId).populate('joinedClubs');
      if (user && user.joinedClubs.length > 0) {
        clubIds = user.joinedClubs.map(club => club._id);
      }
    } else if (req.user.role === 'club_head') {
      // Get club user is head of
      const club = await Club.findOne({ clubHead: req.user.userId });
      if (club) {
        clubIds = [club._id];
      }
    } else if (req.user.role === 'pr_council') {
      // PR council can see all club messages
      const clubs = await Club.find({ isActive: true });
      clubIds = clubs.map(club => club._id);
    }

    if (clubIds.length === 0) {
      return res.json({
        success: true,
        message: 'No club messages found',
        data: {
          messages: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalMessages: 0,
            messagesPerPage: parseInt(limit)
          }
        }
      });
    }

    // Build filter
    const filter = {
      targetType: 'club_specific',
      targetId: { $in: clubIds }
    };
    if (urgent === 'true') {
      filter.isUrgent = true;
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get messages
    const messages = await Message.find(filter)
      .populate('sender', 'name rollNumber clubName role')
      .populate('targetId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalMessages = await Message.countDocuments(filter);
    const totalPages = Math.ceil(totalMessages / limitNum);

    res.json({
      success: true,
      message: 'Club messages retrieved successfully',
      data: {
        messages: messages.map(msg => ({
          _id: msg._id,
          content: msg.content,
          sender: msg.sender,
          targetClub: msg.targetId,
          isUrgent: msg.isUrgent,
          createdAt: msg.createdAt
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalMessages,
          messagesPerPage: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving user club messages:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error retrieving club messages'
      }
    });
  }
});

module.exports = router;