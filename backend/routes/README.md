# Routes Directory

This directory contains all API route handlers for the KMIT PR App backend.

## Structure

- `auth.js` - Authentication routes (login, password change, token verification)
- `events.js` - Event management routes (CRUD operations, registration)
- `clubs.js` - Club management routes (enrollment, member management, broadcasts)
- `users.js` - User management routes (profile, settings)

## Route Patterns

All routes follow RESTful conventions:
- GET for retrieving data
- POST for creating new resources
- PUT for updating existing resources
- DELETE for removing resources

## Authentication

Most routes require JWT authentication. Use the auth middleware to protect routes.

## Error Handling

All routes should use consistent error response format defined in the main server file.