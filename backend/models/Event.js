const mongoose = require('mongoose');

/**
 * Simple Event Schema - Beginner Friendly
 * 
 * Events are created by club heads and PR council members.
 * Students can register for events.
 */
const eventSchema = new mongoose.Schema({
  // Basic event info
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  // When and where
  date: {
    type: Date,
    required: true
  },

  startTime: {
    type: String, // Format: "14:30"
    required: true
  },

  endTime: {
    type: String, // Format: "16:30"
    required: true
  },

  venue: {
    type: String,
    required: true
  },

  // Which club is organizing this event
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },

  // Who created this event
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Students who registered for this event
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Maximum number of students who can register
  maxCapacity: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

// Add indexing for date and clubId fields as required
eventSchema.index({ date: 1 }); // Index for date-based queries (calendar view)
eventSchema.index({ clubId: 1 }); // Index for club-specific event queries
eventSchema.index({ date: 1, clubId: 1 }); // Compound index for efficient date + club queries

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;