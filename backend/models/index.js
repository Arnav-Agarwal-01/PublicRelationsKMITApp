/**
 * Simple Models Export - Beginner Friendly
 * 
 * This file exports all our database models so we can use them easily.
 */

const User = require('./User');
const Event = require('./Event');
const Club = require('./Club');
const Message = require('./Message');
const HallOfFame = require('./HallOfFame');

// Export all models so we can import them like:
// const { User, Event, HallOfFame } = require('./models');
module.exports = {
  User,
  Event,
  Club,
  Message,
  HallOfFame
};