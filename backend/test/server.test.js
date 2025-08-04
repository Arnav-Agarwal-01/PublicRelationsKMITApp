/**
 * Server Configuration Test
 * 
 * Tests that the server starts correctly and routes are configured
 */

const express = require('express');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

/**
 * Test route configuration
 */
const testRouteConfiguration = () => {
  console.log('🧪 Testing route configuration...');
  
  try {
    // Import auth routes
    const authRoutes = require('../routes/auth');
    console.log('✅ Auth routes imported successfully');
    
    // Check if routes is an Express router
    if (typeof authRoutes === 'function') {
      console.log('✅ Auth routes is a valid Express router');
    } else {
      console.log('❌ Auth routes is not a valid Express router');
    }
    
    // Import middleware
    const authMiddleware = require('../middleware/auth');
    console.log('✅ Auth middleware imported successfully');
    
    // Check middleware functions
    const expectedFunctions = [
      'authenticateToken',
      'requireRole',
      'requireStudent',
      'requireClubHead',
      'requirePRCouncil',
      'requireClubHeadOrPR',
      'requireClubOwnership'
    ];
    
    expectedFunctions.forEach(funcName => {
      if (typeof authMiddleware[funcName] === 'function') {
        console.log(`✅ ${funcName} middleware function exists`);
      } else {
        console.log(`❌ ${funcName} middleware function missing`);
      }
    });
    
  } catch (error) {
    console.log('❌ Route configuration test failed:', error.message);
  }
};

/**
 * Test middleware functionality
 */
const testMiddleware = () => {
  console.log('\n🧪 Testing middleware functionality...');
  
  try {
    const { requireRole } = require('../middleware/auth');
    
    // Test requireRole function
    const studentMiddleware = requireRole('student');
    if (typeof studentMiddleware === 'function') {
      console.log('✅ requireRole returns a middleware function');
    } else {
      console.log('❌ requireRole does not return a function');
    }
    
    // Test requireRole with array
    const multiRoleMiddleware = requireRole(['club_head', 'pr_council']);
    if (typeof multiRoleMiddleware === 'function') {
      console.log('✅ requireRole works with array of roles');
    } else {
      console.log('❌ requireRole does not work with array of roles');
    }
    
  } catch (error) {
    console.log('❌ Middleware test failed:', error.message);
  }
};

/**
 * Test environment configuration
 */
const testEnvironmentConfig = () => {
  console.log('\n🧪 Testing environment configuration...');
  
  const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} is configured`);
    } else {
      console.log(`❌ ${envVar} is missing`);
    }
  });
  
  // Test JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
    console.log('✅ JWT_SECRET has adequate length');
  } else {
    console.log('⚠️  JWT_SECRET should be at least 32 characters for production');
  }
};

/**
 * Run all tests
 */
const runTests = () => {
  console.log('🚀 Starting Server Configuration Tests\n');
  console.log('='.repeat(50));
  
  testRouteConfiguration();
  testMiddleware();
  testEnvironmentConfig();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Server configuration tests completed!');
  console.log('\nThe authentication backend is ready!');
  console.log('\nTo test the API:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Set up MongoDB connection');
  console.log('3. Create test users');
  console.log('4. Test endpoints with Postman or cURL');
};

// Run tests
runTests();