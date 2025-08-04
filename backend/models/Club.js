const mongoose = require('mongoose');

/**
 * Simple Club Schema - Beginner Friendly
 * 
 * Clubs have members and can receive join requests from students.
 * Club heads can approve or reject these requests.
 */
const clubSchema = new mongoose.Schema({
  // Basic club info
  name: {
    type: String,
    required: true,
    unique: true
  },

  description: {
    type: String,
    required: true
  },

  // Who manages this club
  clubHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Students who are members of this club
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Students who want to join (waiting for approval)
  pendingRequests: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Is this club active?
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexing for club name and head fields as required
clubSchema.index({ name: 1 }, { unique: true }); // Unique index for club name
clubSchema.index({ clubHead: 1 }); // Index for club head queries
clubSchema.index({ isActive: 1 }); // Index for active club queries

const Club = mongoose.model('Club', clubSchema);
module.exports = Club;