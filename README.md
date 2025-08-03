# KMIT Event Manager

A React Native mobile application for managing college events and club communications at KMIT.

## Project Structure

```
kmit-pr-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   └── services/       # API and utility services
├── assets/             # Images, icons, and other assets
├── App.js              # Main application component
└── app.json            # Expo configuration
```

## Dependencies

- **React Native with Expo SDK 53**
- **Navigation**: @react-navigation/native@^6.x, @react-navigation/stack@^6.x, @react-navigation/bottom-tabs@^6.x
- **Security**: expo-secure-store@~14.2.3
- **Calendar**: react-native-calendars@^1.x
- **UI Components**: react-native-screens, react-native-safe-area-context

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on specific platforms:
   ```bash
   npm run android  # Android
   npm run ios      # iOS
   npm run web      # Web
   ```

## Development

This project is set up with:
- Latest Expo SDK (53.0.20)
- All dependencies verified for compatibility
- Proper project structure for scalable development
- Ready for React Navigation implementation

## Next Steps

The project is ready for implementing:
- Authentication screens
- Event calendar functionality
- Club management features
- Push notifications
- Backend API integration