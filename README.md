# KMIT Events App

A modern React Native app for KMIT college events and club management with dual authentication system.

## Features

- **Dual Authentication**: Student and Council login modes
- **Modern Dark UI**: Clean, professional interface with green accents
- **Form Validation**: Real-time validation with user-friendly error messages
- **Secure Authentication**: JWT-based auth with secure token storage
- **Production Ready**: Optimized for performance and deployment

## Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Test Users

Run the test user creation script:

```bash
cd backend
node scripts/createTestUsers.js
```

**Student Login:**
- Name: Test Student
- Roll Number: TEST001
- Password: Kmit123$

**Council Login:**
- Name: Test Club Head
- Club Name: Test Club
- Password: Councilkmit25

## Project Structure

```
kmit-pr-app/
├── backend/                 # Node.js/Express API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   └── scripts/            # Utility scripts
├── frontend/               # React Native app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── screens/        # App screens
│   │   ├── services/       # API services
│   │   ├── theme/          # Design system
│   │   └── utils/          # Utilities
│   └── app.config.js       # Expo configuration
└── README.md
```

## Key Components

### LoginScreen
- Dual authentication toggle
- Form validation
- Loading states
- Error handling

### Components
- **Button**: Haptic feedback, loading states
- **Input**: Focus states, error display
- **ToggleSwitch**: Student/Council selection

### Services
- **authService**: Login, token management
- **validation**: Form validation utilities

## Production Deployment

1. **Backend**: Deploy to services like Railway, Render, or AWS
2. **Frontend**: Build with `expo build` or EAS Build
3. **Environment**: Update API_URL in app.config.js

## Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT, bcrypt
- **Storage**: Expo SecureStore

## License

MIT License - see LICENSE file for details.