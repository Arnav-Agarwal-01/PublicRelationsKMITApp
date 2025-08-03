# Middleware Directory

This directory contains custom middleware functions for the KMIT PR App backend.

## Middleware Functions

- `auth.js` - JWT authentication and role-based access control
- `validation.js` - Request data validation middleware
- `errorHandler.js` - Custom error handling middleware
- `rateLimiter.js` - Rate limiting for API endpoints

## Usage

Import middleware in your route files:
```javascript
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateEventData } = require('../middleware/validation');
```

## Authentication Middleware

The auth middleware provides:
- Token verification
- User role checking
- Request user attachment
- Protected route handling