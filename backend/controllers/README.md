# Controllers Directory

This directory contains controller functions that handle business logic for the KMIT PR App backend.

## Controllers

- `authController.js` - Authentication logic (login, password change, token management)
- `eventController.js` - Event management logic (CRUD, registration, notifications)
- `clubController.js` - Club management logic (enrollment, member management, broadcasts)
- `userController.js` - User management logic (profile, settings, preferences)

## Controller Pattern

Controllers separate business logic from route handlers:
- Route handlers manage HTTP requests/responses
- Controllers handle data processing and business rules
- Models handle data persistence

## Usage

Import controllers in your route files:
```javascript
const { login, changePassword } = require('../controllers/authController');
const { createEvent, getEvents } = require('../controllers/eventController');
```