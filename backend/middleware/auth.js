/**
 * Authentication Middleware for KMIT PR App
 * 
 * This file provides middleware functions for:
 * - JWT token verification
 * - Role-based access control
 * - User authentication checking
 * 
 * Requirements: 1.3, 2.3, 3.1, 3.2
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT tokens
 * 
 * Verifies the JWT token from Authorization header
 * Adds user information to req.user if valid
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access token is required'
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Optional: Verify user still exists in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User no longer exists'
        }
      });
    }

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      name: decoded.name,
      role: decoded.role,
      rollNumber: decoded.rollNumber,
      clubName: decoded.clubName
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired. Please login again.'
        }
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid access token'
        }
      });
    }

    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error verifying token'
      }
    });
  }
};

/**
 * Middleware to check if user has specific role(s)
 * 
 * @param {string|string[]} allowedRoles - Role or array of roles allowed
 * @returns {Function} Express middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentication required'
        }
      });
    }

    // Convert single role to array for consistent checking
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'You do not have permission to access this resource'
        }
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is a student
 */
const requireStudent = requireRole('student');

/**
 * Middleware to check if user is a club head
 */
const requireClubHead = requireRole('club_head');

/**
 * Middleware to check if user is PR council member
 */
const requirePRCouncil = requireRole('pr_council');

/**
 * Middleware to check if user is either club head or PR council
 */
const requireClubHeadOrPR = requireRole(['club_head', 'pr_council']);

/**
 * Middleware to check if user owns a specific club
 * Used for club-specific operations
 * 
 * @param {string} clubIdParam - Name of the parameter containing club ID
 * @returns {Function} Express middleware function
 */
const requireClubOwnership = (clubIdParam = 'clubId') => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Authentication required'
          }
        });
      }

      // PR council can access any club
      if (req.user.role === 'pr_council') {
        return next();
      }

      // For club heads, verify they own the club
      if (req.user.role === 'club_head') {
        const clubId = req.params[clubIdParam];
        
        // Find the club and check ownership
        const Club = require('../models/Club');
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

        // Check if user is the club head
        if (club.clubHead.toString() !== req.user.userId) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'NOT_CLUB_OWNER',
              message: 'You can only manage your own club'
            }
          });
        }

        return next();
      }

      // Students cannot access club management
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'You do not have permission to manage clubs'
        }
      });

    } catch (error) {
      console.error('Club ownership check error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error checking club ownership'
        }
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireStudent,
  requireClubHead,
  requirePRCouncil,
  requireClubHeadOrPR,
  requireClubOwnership
};