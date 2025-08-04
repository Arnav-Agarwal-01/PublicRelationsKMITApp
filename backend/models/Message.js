const mongoose = require('mongoose');

/**
 * Simple Message Schema - Beginner Friendly
 * 
 * Messages can be sent to the whole college or to specific clubs.
 * PR council can send college-wide messages.
 * Club heads can send messages to their club members.
 */
const messageSchema = new mongoose.Schema({
  // What the message says
  content: {
    type: String,
    required: true
  },

  // Who sent this message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Is this for everyone or just one club?
  targetType: {
    type: String,
    required: true,
    enum: ['college_wide', 'club_specific']
  },

  // If club_specific, which club? (null for college_wide)
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    default: null
  },

  // Is this message urgent?
  isUrgent: {
    type: Boolean,
    default: false
  },

  // Who has read this message
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add indexing for targetType and createdAt fields as required
messageSchema.index({ targetType: 1 }); // Index for message type queries
messageSchema.index({ createdAt: -1 }); // Index for chronological message retrieval (newest first)
messageSchema.index({ targetType: 1, targetId: 1 }); // Compound index for club-specific messages
messageSchema.index({ targetType: 1, createdAt: -1 }); // Compound index for efficient message listing

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;