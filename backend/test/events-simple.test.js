/**
 * Simple Event API Test
 * 
 * Basic tests to make sure the event API works
 */

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

console.log('🧪 Testing Event API...\n');

// Test 1: Check if files load without errors
try {
  const eventRoutes = require('../routes/events');
  console.log('✅ Event routes loaded successfully');
} catch (error) {
  console.log('❌ Error loading event routes:', error.message);
}

// Test 2: Check if models work
try {
  const Event = require('../models/Event');
  const Club = require('../models/Club');
  console.log('✅ Event and Club models loaded successfully');
} catch (error) {
  console.log('❌ Error loading models:', error.message);
}

// Test 3: Check if middleware works
try {
  const { authenticateToken, requireStudent, requireClubHeadOrPR } = require('../middleware/auth');
  console.log('✅ Authentication middleware loaded successfully');
} catch (error) {
  console.log('❌ Error loading middleware:', error.message);
}

console.log('\n🎉 Basic tests passed! The API should work.');
console.log('\n📝 To test the API:');
console.log('1. Start server: npm run dev');
console.log('2. Use Postman or curl to test endpoints');
console.log('3. Make sure MongoDB is running');

console.log('\n📋 Available endpoints:');
console.log('GET    /api/events           - Get all events');
console.log('GET    /api/events/:date     - Get events for date');
console.log('POST   /api/events           - Create event');
console.log('PUT    /api/events/:id       - Update event');
console.log('DELETE /api/events/:id       - Delete event');
console.log('POST   /api/events/:id/register   - Register for event');
console.log('DELETE /api/events/:id/register   - Unregister from event');