/**
 * Test Setup Configuration
 * 
 * This file sets up the test environment for Jest tests
 */

const mongoose = require('mongoose');

// Set test timeout
jest.setTimeout(30000);

// Connect to test database before all tests
beforeAll(async () => {
  // Use test database
  const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/kmit-pr-app-test';
  
  try {
    await mongoose.connect(testDbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log('Connected to test database');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    process.exit(1);
  }
});

// Clean up after all tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
    console.log('Disconnected from test database');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});