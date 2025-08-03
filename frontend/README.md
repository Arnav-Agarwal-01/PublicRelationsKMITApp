# KMIT PR App - Frontend

React Native Expo application for the KMIT College Event Management System.

## Setup

### Prerequisites
- Node.js (v18+)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS device/simulator
- `npm run web` - Start web version

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   └── services/       # API calls and utilities
├── assets/             # Images, fonts, etc.
├── App.js             # Main app component
├── app.json           # Expo configuration
└── package.json       # Dependencies and scripts
```

## Features

- **Authentication Screens**: Login with role selection
- **Calendar View**: Monthly event calendar with registration
- **Club Management**: Browse and join clubs
- **Event Creation**: Create and manage events (role-based)
- **Messaging**: View announcements and club messages
- **Profile Management**: User settings and preferences

## Dependencies

- **Expo SDK**: ~53.0.20
- **React Navigation**: v6 for navigation
- **Expo SecureStore**: Secure token storage
- **React Native Calendars**: Calendar component
- **React Native Web**: Web platform support

## Development

### Running on Different Platforms

**Mobile Device:**
1. Install Expo Go app
2. Run `npm start`
3. Scan QR code with camera (iOS) or Expo Go (Android)

**Web Browser:**
1. Run `npm start`
2. Press `w` or visit http://localhost:19006

**iOS Simulator:**
1. Install Xcode
2. Run `npm start`
3. Press `i`

**Android Emulator:**
1. Install Android Studio
2. Set up AVD
3. Run `npm start`
4. Press `a`

## API Integration

The app connects to the backend API at `http://localhost:3000/api`. Make sure the backend server is running before testing API-dependent features.

## Building for Production

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Troubleshooting

**Metro bundler issues:**
```bash
npx expo start --clear
```

**Dependency conflicts:**
```bash
npx expo install --fix
```

**Web support missing:**
```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```