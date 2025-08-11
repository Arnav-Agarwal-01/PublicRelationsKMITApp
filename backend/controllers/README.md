# Controllers Directory

This directory contains controller functions that handle business logic for the KMIT PR App backend.

The controllers directory exists but the actual controller files haven't been created yet. In the current implementation, the business logic is directly in the route files rather than being separated into controllers.

Routes contain both routing AND business logic:

routes/auth.js - Contains authentication logic directly
routes/events.js - Contains event management logic directly
routes/clubs.js - Contains club management logic directly
routes/messages.js - Contains messaging logic directly
routes/hallOfFame.js - Contains hall of fame logic directly

## Controllers

- `authController.js` - Authentication logic (login, password change, token management)
- `eventController.js` - Event management logic (CRUD, registration, notifications)
- `clubController.js` - Club management logic (enrollment, member management, broadcasts)
- `userController.js` - User management logic (profile, settings, preferences)

- Traditional MVC (what the README suggests):
Route → Controller → Model → Database
Current Implementation:


Route → Model → Database

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
