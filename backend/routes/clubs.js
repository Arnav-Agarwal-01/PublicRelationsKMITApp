/**
 * Club Management API
 * 
 * Handles club operations including listing, member management, and join requests
 * Supports specific clubs: SAIL, VAAN, LIFE, KRYPT
 */

const express = require('express');
const Club = require('../models/Club');
const User = require('../models/User');
const { authenticateToken, requireClubHeadOrPR, requireStudent } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/clubs/my-clubs
 * Get clubs that the current user is a member of
 * NOTE: This route must be defined before /:id to avoid conflicts
 */
router.get('/my-clubs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const clubs = await Club.find({ 
      members: userId,
      isActive: true 
    })
    .populate('clubHead', 'name rollNumber')
    .select('name description category brandColor logoUrl establishedYear clubHead memberCount isActive createdAt');

    res.json({
      success: true,
      message: 'User clubs retrieved successfully',
      data: {
        clubs: clubs,
        totalCount: clubs.length
      }
    });
  } catch (error) {
    console.error('Error getting user clubs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error retrieving user clubs'
      }
    });
  }
});

// Helper function to check if user can manage this club
const canManageClub = async (user, clubId) => {
  // PR council can manage any club
  if (user.role === 'pr_council') return true;
  
  // Club heads can only manage their own club
  if (user.role === 'club_head') {
    const club = await Club.findById(clubId);
    if (!club) return false;
    return club.clubHead.toString() === user.userId;
  }
  
  return false;
};

/**
 * GET /api/clubs
 * Get all clubs with enhanced information
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const clubs = await Club.find({ isActive: true })
      .populate('clubHead', 'name rollNumber')
      .populate('members', 'name rollNumber')
      .sort({ name: 1 });

    // Add computed fields for each club
    const enhancedClubs = clubs.map(club => ({
      _id: club._id,
      name: club.name,
      description: club.description,
      category: club.category || 'general',
      brandColor: club.brandColor || '#00ff88',
      logoUrl: club.logoUrl || null,
      establishedYear: club.establishedYear || 2020,
      clubHead: club.clubHead,
      memberCount: club.members.length,
      pendingRequestsCount: club.pendingRequests.length,
      isActive: club.isActive,
      createdAt: club.createdAt,
      // Don't expose full member list in general listing for privacy
      canJoin: !club.members.some(member => member._id.toString() === req.user.userId)
    }));

    res.json({
      success: true,
      message: 'Clubs retrieved successfully',
      data: {
        clubs: enhancedClubs,
        totalCount: enhancedClubs.length
      }
    });
  } catch (error) {
    console.error('Error getting clubs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error retrieving clubs'
      }
    });
  }
});

/**
 * GET /api/clubs/:id
 * Get detailed information about a specific club
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const clubId = req.params.id;
    
    const club = await Club.findById(clubId)
      .populate('clubHead', 'name rollNumber')
      .populate('members', 'name rollNumber')
      .populate('pendingRequests.userId', 'name rollNumber');

    if (!club) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CLUB_NOT_FOUND',
          message: 'Club not found'
        }
      });
    }

    // Check if current user can see detailed information
    const canManage = await canManageClub(req.user, clubId);
    const isMember = club.members.some(member => member._id.toString() === req.user.userId);
    
    const response = {
      _id: club._id,
      name: club.name,
      description: club.description,
      category: club.category || 'general',
      brandColor: club.brandColor || '#00ff88',
      logoUrl: club.logoUrl || null,
      establishedYear: club.establishedYear || 2020,
      clubHead: club.clubHead,
      memberCount: club.members.length,
      isActive: club.isActive,
      createdAt: club.createdAt,
      userStatus: {
        isMember,
        canManage,
        hasPendingRequest: club.pendingRequests.some(req => req.userId._id.toString() === req.user.userId)
      }
    };

    // Only show member list to club heads, PR council, or members
    if (canManage || isMember) {
      response.members = club.members;
    }

    // Only show pending requests to club heads and PR council
    if (canManage) {
      response.pendingRequests = club.pendingRequests;
    }

    res.json({
      success: true,
      message: 'Club details retrieved successfully',
      data: {
        club: response
      }
    });
  } catch (error) {
    console.error('Error getting club details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error retrieving club details'
      }
    });
  }
});

/**
 * GET /api/clubs/:id/members
 * Get members of a specific club
 */
router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    const clubId = req.params.id;
    
    // Check if user can view members
    const canManage = await canManageClub(req.user, clubId);
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

    const isMember = club.members.some(member => member.toString() === req.user.userId);
    
    // Only club heads, PR council, or members can view member list
    if (!canManage && !isMember) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to view club members'
        }
      });
    }

    await club.populate('members', 'name rollNumber createdAt');

    res.json({
      success: true,
      message: 'Club members retrieved successfully',
      data: {
        clubName: club.name,
        members: club.members,
        memberCount: club.members.length
      }
    });
  } catch (error) {
    console.error('Error getting club members:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error retrieving club members'
      }
    });
  }
});

/**
 * POST /api/clubs/:id/join-request
 * Submit a join request to a club (students only)
 */
router.post('/:id/join-request', authenticateToken, requireStudent, async (req, res) => {
  try {
    const clubId = req.params.id;
    const userId = req.user.userId;

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

    // Check if user is already a member
    if (club.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_MEMBER',
          message: 'You are already a member of this club'
        }
      });
    }

    // Check if user already has a pending request
    if (club.pendingRequests.some(request => request.userId.toString() === userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REQUEST_EXISTS',
          message: 'You already have a pending request for this club'
        }
      });
    }

    // Add join request
    club.pendingRequests.push({
      userId: userId,
      requestDate: new Date()
    });

    await club.save();

    res.json({
      success: true,
      message: 'Join request submitted successfully',
      data: {
        clubName: club.name,
        requestDate: new Date(),
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error submitting join request:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error submitting join request'
      }
    });
  }
});

/**
 * PUT /api/clubs/:id/approve-member
 * Approve or reject a join request (club heads and PR council only)
 */
router.put('/:id/approve-member', authenticateToken, requireClubHeadOrPR, async (req, res) => {
  try {
    const clubId = req.params.id;
    const { userId, action } = req.body; // action: 'approve' or 'reject'

    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'User ID and valid action (approve/reject) are required'
        }
      });
    }

    // Check if user can manage this club
    if (!(await canManageClub(req.user, clubId))) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only manage your own club members'
        }
      });
    }

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

    // Find the pending request
    const requestIndex = club.pendingRequests.findIndex(
      request => request.userId.toString() === userId
    );

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REQUEST_NOT_FOUND',
          message: 'Join request not found'
        }
      });
    }

    // Remove the request from pending
    club.pendingRequests.splice(requestIndex, 1);

    let message = '';
    if (action === 'approve') {
      // Add user to club members
      club.members.push(userId);
      
      // Add club to user's joinedClubs
      await User.findByIdAndUpdate(userId, {
        $addToSet: { joinedClubs: clubId }
      });
      
      message = 'Member approved and added to club successfully';
    } else {
      message = 'Join request rejected';
    }

    await club.save();

    res.json({
      success: true,
      message: message,
      data: {
        clubName: club.name,
        action: action,
        userId: userId
      }
    });
  } catch (error) {
    console.error('Error processing member request:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error processing member request'
      }
    });
  }
});

/**
 * DELETE /api/clubs/:id/remove-member
 * Remove a member from the club (club heads and PR council only)
 */
router.delete('/:id/remove-member', authenticateToken, requireClubHeadOrPR, async (req, res) => {
  try {
    const clubId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'User ID is required'
        }
      });
    }

    // Check if user can manage this club
    if (!(await canManageClub(req.user, clubId))) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only manage your own club members'
        }
      });
    }

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

    // Check if user is a member
    if (!club.members.includes(userId)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_A_MEMBER',
          message: 'User is not a member of this club'
        }
      });
    }

    // Remove user from club members
    club.members = club.members.filter(member => member.toString() !== userId);
    
    // Remove club from user's joinedClubs
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedClubs: clubId }
    });

    await club.save();

    res.json({
      success: true,
      message: 'Member removed from club successfully',
      data: {
        clubName: club.name,
        removedUserId: userId
      }
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error removing member'
      }
    });
  }
});

module.exports = router;