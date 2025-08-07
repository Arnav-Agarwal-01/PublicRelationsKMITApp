/**
 * KMIT PR App Backend Server
 * Main server file with Express configuration and MongoDB connection
 * 
 * This file sets up:
 * - Express server with middleware
 * - MongoDB connection with error handling
 * - CORS configuration for mobile app
 * - Basic route structure
 * - Environment variable validation
 */

// Load environment variables first
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import route handlers
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const clubRoutes = require('./routes/clubs');
const hallOfFameRoutes = require('./routes/hallOfFame');
// const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware Configuration
 */

// CORS configuration for React Native/Expo app
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:19006'];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

/**
 * MongoDB Connection
 * Using latest MongoDB Atlas connection string format
 */
const connectDB = async () => {
  try {
    // Validate required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    // MongoDB connection options for latest version
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    // In development, show more details
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }

    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Routes Configuration
 * API routes will be added as they are implemented
 */

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KMIT PR App Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API base route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KMIT PR App API v1.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      events: '/api/events',
      clubs: '/api/clubs',
      hallOfFame: '/api/hall-of-fame',
      users: '/api/users (coming soon)'
    }
  });
});

// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/hall-of-fame', hallOfFameRoutes);
// app.use('/api/users', userRoutes);

/**
 * Error Handling Middleware
 */

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString()
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  // Default error response
  let error = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong on the server',
      timestamp: new Date().toISOString()
    }
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.error.code = 'VALIDATION_ERROR';
    error.error.message = 'Invalid data provided';
    error.error.details = err.errors;
    return res.status(400).json(error);
  }

  if (err.name === 'CastError') {
    error.error.code = 'INVALID_ID';
    error.error.message = 'Invalid ID format';
    return res.status(400).json(error);
  }

  if (err.code === 11000) {
    error.error.code = 'DUPLICATE_ENTRY';
    error.error.message = 'Duplicate entry found';
    return res.status(409).json(error);
  }

  // In development, include stack trace
  if (process.env.NODE_ENV === 'development') {
    error.error.stack = err.stack;
  }

  res.status(500).json(error);
});

/**
 * Server Startup
 */
const startServer = async () => {
  try {
    // Validate environment variables
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Connect to MongoDB
    await connectDB();

    // Start the server
    const server = app.listen(PORT, () => {
      console.log('🚀 Server started successfully!');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base: http://localhost:${PORT}/api`);
      console.log('-----------------------------------');
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        if (mongoose.connection.readyState !== 0) {
          mongoose.connection.close();
          console.log('✅ MongoDB connection closed');
        }
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        if (mongoose.connection.readyState !== 0) {
          mongoose.connection.close();
          console.log('✅ MongoDB connection closed');
        }
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;