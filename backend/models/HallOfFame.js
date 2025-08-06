const mongoose = require('mongoose');

/**
 * Simple Hall of Fame Schema - Beginner Friendly
 * 
 * This model stores achievements and accomplishments for students, clubs, and faculty.
 * Only PR council members can add, edit, or delete achievements.
 * All users can view public achievements.
 */
const hallOfFameSchema = new mongoose.Schema({
  // Achievement details
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  // Achievement category - must be one of these types
  category: {
    type: String,
    required: true,
    enum: ['academic', 'sports', 'cultural', 'technical', 'leadership']
  },

  // Who achieved this
  achiever: {
    name: {
      type: String,
      required: true
    },
    rollNumber: {
      type: String,
      default: null // For students only
    },
    clubName: {
      type: String,
      default: null // For club achievements
    },
    type: {
      type: String,
      required: true,
      enum: ['student', 'club', 'faculty']
    }
  },

  // When this achievement happened
  date: {
    type: Date,
    required: true
  },

  // Optional achievement image
  imageUrl: {
    type: String,
    default: null
  },

  // Should this be visible to everyone?
  isPublic: {
    type: Boolean,
    default: true
  },

  // Who added this achievement (PR council member)
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Add indexing for category and date fields as required
hallOfFameSchema.index({ category: 1 }); // Index for category-based queries
hallOfFameSchema.index({ date: -1 }); // Index for date-based sorting (newest first)

const HallOfFame = mongoose.model('HallOfFame', hallOfFameSchema);
module.exports = HallOfFame;