/**
 * Authentication Routes for KMIT PR App
 * 
 * This file handles:
 * - User login with role-based authentication
 * - Password change functionality
 * - JWT token generation and validation
 * 
 * Routes:
 * - POST /api/auth/login - User login
 * - POST /api/auth/change-password - Change user password
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * 
 * Handles login for both students and council members
 * Students: name + rollNumber + password
 * Council: name + clubName + password
 * 
 * Requirements: 1.1, 1.3, 3.1, 3.2
 */
router.post('/login', async (req, res) => {
  try {
    const { name, rollNumber, clubName, password, userType } = req.body;

    // Validate required fields
    if (!name || !password || !userType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Name, password, and user type are required'
        }
      });
    }

    // Validate user type specific fields
    if (userType === 'student' && !rollNumber) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_ROLL_NUMBER',
          message: 'Roll number is required for student login'
        }
      });
    }

    if (userType === 'council' && !clubName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CLUB_NAME',
          message: 'Club name is required for council login'
        }
      });
    }

    // Find user based on type
    let user;
    if (userType === 'student') {
      user = await User.findOne({ 
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        role: 'student'
      });
    } else if (userType === 'council') {
      user = await User.findOne({ 
        name: name.trim(),
        clubName: clubName.trim(),
        role: { $in: ['club_head', 'pr_council'] }
      });
    }

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials. Please check your details and try again.'
        }
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials. Please check your details and try again.'
        }
      });
    }

    // Generate JWT token with 1.5 month expiry (45 days)
    const tokenPayload = {
      userId: user._id,
      name: user.name,
      role: user.role,
      rollNumber: user.rollNumber,
      clubName: user.clubName
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '45d' } // 1.5 months
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          rollNumber: user.rollNumber,
          clubName: user.clubName,
          isPasswordChanged: user.isPasswordChanged,
          joinedClubs: user.joinedClubs
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred during login. Please try again.'
      }
    });
  }
});

/**
 * POST /api/auth/change-password
 * 
 * Allows users to change their password
 * Requires authentication token
 * 
 * Requirements: 2.2, 2.3, 3.2
 */
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Current password and new password are required'
        }
      });
    }

    // Validate new password requirements (8+ chars, at least one special character)
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'New password must be at least 8 characters long'
        }
      });
    }

    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialCharRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'New password must contain at least one special character'
        }
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect'
        }
      });
    }

    // Update password and mark as changed
    user.password = newPassword;
    user.isPasswordChanged = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while changing password. Please try again.'
      }
    });
  }
});

/**
 * GET /api/auth/verify-token
 * 
 * Verifies if the provided token is valid
 * Used for checking authentication status
 */
router.get('/verify-token', authenticateToken, (req, res) => {
  // If we reach here, token is valid (middleware passed)
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

module.exports = router;