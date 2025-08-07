/**
 * Simple Hall of Fame API - Production Ready
 * 
 * Manages achievements for students, clubs, and faculty.
 * PR council can manage, everyone can view.
 * 
 * Requirements: 12.1, 12.2, 12.4, 12.5
 */

const express = require('express');
const HallOfFame = require('../models/HallOfFame');
const { authenticateToken, requirePRCouncil } = require('../middleware/auth');

const router = express.Router();

// Valid categories and achiever types
const CATEGORIES = ['academic', 'sports', 'cultural', 'technical', 'leadership'];
const ACHIEVER_TYPES = ['student', 'club', 'faculty'];

/**
 * GET /api/hall-of-fame/categories
 * Returns available achievement categories
 */
router.get('/categories', authenticateToken, (req, res) => {
  const categories = CATEGORIES.map(cat => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));

  res.json({
    success: true,
    categories
  });
});

/**
 * GET /api/hall-of-fame
 * Get achievements with optional category filter
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    
    const filter = { isPublic: true };
    if (category && CATEGORIES.includes(category)) {
      filter.category = category;
    }

    const achievements = await HallOfFame.find(filter)
      .populate('addedBy', 'name')
      .sort({ date: -1 })
      .limit(100); // Simple limit, no complex pagination

    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting achievements'
    });
  }
});

/**
 * POST /api/hall-of-fame
 * Create achievement (PR council only)
 */
router.post('/', authenticateToken, requirePRCouncil, async (req, res) => {
  try {
    const { title, description, category, achiever, date, imageUrl } = req.body;

    // Simple validation
    if (!title || !description || !category || !achiever?.name || !achiever?.type || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, category, achiever (name, type), date'
      });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}`
      });
    }

    if (!ACHIEVER_TYPES.includes(achiever.type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid achiever type. Must be one of: ${ACHIEVER_TYPES.join(', ')}`
      });
    }

    const achievement = new HallOfFame({
      title,
      description,
      category,
      achiever,
      date: new Date(date),
      imageUrl: imageUrl || null,
      isPublic: true,
      addedBy: req.user.userId
    });

    await achievement.save();

    res.status(201).json({
      success: true,
      message: 'Achievement created',
      achievement
    });
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating achievement'
    });
  }
});

/**
 * PUT /api/hall-of-fame/:id
 * Update achievement (PR council only)
 */
router.put('/:id', authenticateToken, requirePRCouncil, async (req, res) => {
  try {
    const { title, description, category, achiever, date, imageUrl } = req.body;

    // Validate category if provided
    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}`
      });
    }

    // Validate achiever type if provided
    if (achiever?.type && !ACHIEVER_TYPES.includes(achiever.type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid achiever type. Must be one of: ${ACHIEVER_TYPES.join(', ')}`
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (achiever) updateData.achiever = achiever;
    if (date) updateData.date = new Date(date);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const achievement = await HallOfFame.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      message: 'Achievement updated',
      achievement
    });
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating achievement'
    });
  }
});

/**
 * DELETE /api/hall-of-fame/:id
 * Delete achievement (PR council only)
 */
router.delete('/:id', authenticateToken, requirePRCouncil, async (req, res) => {
  try {
    const achievement = await HallOfFame.findByIdAndDelete(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      message: 'Achievement deleted'
    });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting achievement'
    });
  }
});

module.exports = router;