/**
 * Simple Event Management API
 * 
 * Easy to understand routes for managing college events
 * All routes require authentication
 */

const express = require('express');
const Event = require('../models/Event');
const Club = require('../models/Club');
const { authenticateToken, requireClubHeadOrPR, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Helper function to check if user can manage this event
const canManageEvent = async (user, eventId) => {
  // PR council can manage any event
  if (user.role === 'pr_council') return true;

  // Club heads can only manage their own club's events
  if (user.role === 'club_head') {
    const event = await Event.findById(eventId).populate('clubId');
    if (!event) return false;
    return event.clubId.clubHead.toString() === user.userId;
  }

  return false;
};

/**
 * GET /api/events
 * Get all events (everyone can see events)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('clubId', 'name')
      .populate('createdBy', 'name')
      .sort({ date: 1 });

    res.json({
      success: true,
      events: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting events'
    });
  }
});

/**
 * GET /api/events/:date
 * Get events for a specific date (YYYY-MM-DD)
 */
router.get('/:date', authenticateToken, async (req, res) => {
  try {
    const date = new Date(req.params.date);

    // Get events for this day
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const events = await Event.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('clubId', 'name')
      .populate('createdBy', 'name')
      .populate('registeredUsers', 'name rollNumber')
      .sort({ startTime: 1 });

    res.json({
      success: true,
      events: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting events for date'
    });
  }
});

/**
 * POST /api/events
 * Create a new event (club heads and PR council only)
 */
router.post('/', authenticateToken, requireClubHeadOrPR, async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, venue, clubId } = req.body;

    // Basic validation
    if (!title || !description || !date || !startTime || !endTime || !venue || !clubId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Club heads can only create events for their own club
    if (req.user.role === 'club_head' && club.clubHead.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only create events for your own club'
      });
    }

    // Create the event
    const event = new Event({
      title,
      description,
      date: new Date(date),
      startTime,
      endTime,
      venue,
      clubId,
      createdBy: req.user.userId,
      maxCapacity: req.body.maxCapacity || 100
    });

    await event.save();
    await event.populate('clubId', 'name');
    await event.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating event'
    });
  }
});

/**
 * PUT /api/events/:id
 * Update an event (club heads for their events, PR council for any)
 */
router.put('/:id', authenticateToken, requireClubHeadOrPR, async (req, res) => {
  try {
    const eventId = req.params.id;

    // Check if user can manage this event
    if (!(await canManageEvent(req.user, eventId))) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own club events'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update fields if provided
    const { title, description, date, startTime, endTime, venue, maxCapacity } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (venue) event.venue = venue;
    if (maxCapacity) event.maxCapacity = maxCapacity;

    await event.save();
    await event.populate('clubId', 'name');
    await event.populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating event'
    });
  }
});

/**
 * DELETE /api/events/:id
 * Delete an event (club heads for their events, PR council for any)
 */
router.delete('/:id', authenticateToken, requireClubHeadOrPR, async (req, res) => {
  try {
    const eventId = req.params.id;

    // Check if user can manage this event
    if (!(await canManageEvent(req.user, eventId))) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own club events'
      });
    }

    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting event'
    });
  }
});

/**
 * POST /api/events/:id/register
 * Register for an event (students only)
 */
router.post('/:id/register', authenticateToken, requireStudent, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if already registered
    if (event.registeredUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check capacity
    if (event.registeredUsers.length >= event.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Register the user
    event.registeredUsers.push(userId);
    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for event',
      registeredCount: event.registeredUsers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering for event'
    });
  }
});

/**
 * DELETE /api/events/:id/register
 * Unregister from an event (students only)
 */
router.delete('/:id/register', authenticateToken, requireStudent, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registered
    if (!event.registeredUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    // Remove registration
    event.registeredUsers = event.registeredUsers.filter(id => id.toString() !== userId);
    await event.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from event',
      registeredCount: event.registeredUsers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unregistering from event'
    });
  }
});

module.exports = router;