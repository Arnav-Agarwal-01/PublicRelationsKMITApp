const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Simple User Schema - Beginner Friendly
 * 
 * This handles three types of users:
 * 1. Students - have rollNumber
 * 2. Club Heads - have clubName  
 * 3. PR Council - have clubName and special role
 */
const userSchema = new mongoose.Schema({
  // Basic info
  name: {
    type: String,
    required: true
  },

  // For students only
  rollNumber: {
    type: String,
    default: null
  },

  // For club heads and PR council
  clubName: {
    type: String,
    default: null
  },

  // Password (will be hashed automatically)
  password: {
    type: String,
    required: true
  },

  // User type: 'student', 'club_head', or 'pr_council'
  role: {
    type: String,
    required: true,
    default: 'student'
  },

  // Has user changed from initial password?
  isPasswordChanged: {
    type: Boolean,
    default: false
  },

  // Clubs that student has joined
  joinedClubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is new or changed
  if (!this.isModified('password')) {
    return next();
  }
  
  // Hash the password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Add proper indexing for rollNumber and clubName fields as required
userSchema.index({ rollNumber: 1 }, { sparse: true }); // Sparse index since not all users have rollNumber
userSchema.index({ clubName: 1 }, { sparse: true }); // Sparse index since not all users have clubName
userSchema.index({ role: 1 }); // Index for role-based queries

const User = mongoose.model('User', userSchema);
module.exports = User;