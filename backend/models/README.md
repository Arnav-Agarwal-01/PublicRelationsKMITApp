# Models Directory

This directory contains all Mongoose data models for the KMIT PR App.

## Models

- `User.js` - User model with authentication and role management
- `Event.js` - Event model with club relationships and registration tracking
- `Club.js` - Club model with member management capabilities
- `Message.js` - Message model for broadcast communications

## Schema Design

All models follow consistent patterns:
- Timestamps (createdAt, updatedAt) are automatically managed
- Proper indexing for frequently queried fields
- Validation rules for data integrity
- References between related documents

## Usage

Import models in your route handlers:
```javascript
const User = require('../models/User');
const Event = require('../models/Event');
```