# KMIT PR App

A comprehensive event management system for KMIT College with separate frontend and backend applications.

## Project Structure

```
kmit-pr-app/
├── frontend/          # React Native Expo app
├── backend/           # Node.js Express API server
└── README.md         # This file
```

## Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo CLI
- MongoDB (local or Atlas)

### Running the Application

**1. Start Backend Server:**
```bash
cd backend
npm install
npm run dev
```
Server runs on: http://localhost:3000

**2. Start Frontend App:**
```bash
cd frontend
npm install
npm start
```

**3. View the App:**
- Scan QR code with Expo Go app
- Press `w` for web browser
- Press `i` for iOS simulator
- Press `a` for Android emulator

## Features

- **Authentication**: Role-based login (Students, Club Heads, PR Council)
- **Event Management**: Create, view, and register for college events
- **Club Management**: Join clubs and manage memberships
- **Messaging**: College-wide and club-specific announcements
- **Calendar Integration**: Visual event calendar with registration

## Tech Stack

**Frontend:**
- React Native with Expo SDK 53
- React Navigation v6
- Expo SecureStore for authentication
- React Native Calendars

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

## Development

See individual README files in `frontend/` and `backend/` folders for detailed setup instructions.

## API Documentation

Backend API runs on `http://localhost:3000/api` with endpoints:
- `/auth` - Authentication
- `/events` - Event management
- `/clubs` - Club operations
- `/messages` - Messaging system

## Contributing

1. Follow the task list in `.kiro/specs/kmit-pr-app/tasks.md`
2. Implement features incrementally
3. Test both frontend and backend components
4. Maintain consistent code style