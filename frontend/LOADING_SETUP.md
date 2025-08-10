# Loading Screen Setup Guide

## Overview
This guide explains how to set up and use the loading screen components with your MP4 video file.

## Components Available

### 1. LoadingScreen (Video-enabled)
- Plays MP4 videos as loading screen
- Requires `expo-av` dependency
- Has fallback to simple loading if video fails

### 2. SimpleLoadingScreen (No dependencies)
- Animated loading screen without video
- Uses built-in React Native animations
- Works immediately without additional setup

## Setup Instructions

### Step 1: Install Required Dependencies (for video support)

```bash
cd kmit-pr-app/frontend
npx expo install expo-av
```

### Step 2: Add Your MP4 File

1. Place your MP4 file in the `assets` folder:
   ```
   kmit-pr-app/frontend/assets/loading-video.mp4
   ```

2. Or create a `videos` subfolder for organization:
   ```
   kmit-pr-app/frontend/assets/videos/loading-video.mp4
   ```

### Step 3: Update Your App.js

Here's how to integrate the loading screen into your main app:

```javascript
import React, { useState, useEffect } from 'react';
import { LoadingScreen, SimpleLoadingScreen } from './src/components';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      try {
        // Your app initialization logic here
        // e.g., loading user data, checking auth, etc.
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAppReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setAppReady(true);
      }
    };

    initializeApp();
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Show loading screen
  if (isLoading || !appReady) {
    return (
      <LoadingScreen
        videoSource={require('./assets/loading-video.mp4')}
        onLoadingComplete={handleLoadingComplete}
        autoHide={true}
        duration={4000}
        backgroundColor="#000000"
        overlayText="KMIT PR"
        showFallback={true}
      />
    );
  }

  // Your main app content
  return (
    <YourMainAppComponent />
  );
}
```

### Step 4: Alternative Simple Setup (No Video)

If you prefer not to use video or want a fallback:

```javascript
import React, { useState } from 'react';
import { SimpleLoadingScreen } from './src/components';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <SimpleLoadingScreen
        onLoadingComplete={handleLoadingComplete}
        duration={3000}
        backgroundColor="#000000"
        overlayText="KMIT PR"
        showProgress={true}
      />
    );
  }

  return <YourMainAppComponent />;
}
```

## Component Props

### LoadingScreen Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `videoSource` | `require()` | - | Path to your MP4 file |
| `onLoadingComplete` | `function` | - | Callback when loading completes |
| `autoHide` | `boolean` | `true` | Auto hide after duration |
| `duration` | `number` | `3000` | Duration in milliseconds |
| `backgroundColor` | `string` | `#000000` | Background color |
| `overlayText` | `string` | - | Text to display over video |
| `overlayTextStyle` | `object` | - | Style for overlay text |
| `showFallback` | `boolean` | `true` | Show fallback if video fails |
| `fallbackText` | `string` | `Loading...` | Fallback loading text |

### SimpleLoadingScreen Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onLoadingComplete` | `function` | - | Callback when loading completes |
| `duration` | `number` | `3000` | Duration in milliseconds |
| `backgroundColor` | `string` | `#000000` | Background color |
| `overlayText` | `string` | `KMIT PR` | Main title text |
| `showProgress` | `boolean` | `true` | Show progress bar |
| `logoSource` | `require()` | - | Optional logo image |

## Video File Requirements

### Recommended Specifications:
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1080x1920 (portrait) or 1920x1080 (landscape)
- **Duration**: 2-5 seconds for loading screens
- **File Size**: Under 5MB for better performance
- **Frame Rate**: 30fps or 60fps

### Optimization Tips:
1. Keep the video short (2-5 seconds)
2. Use a loop-friendly video that can repeat seamlessly
3. Optimize file size for mobile devices
4. Test on both iOS and Android devices

## Usage Examples

### Basic Video Loading Screen
```javascript
<LoadingScreen
  videoSource={require('./assets/loading-video.mp4')}
  onLoadingComplete={() => setLoading(false)}
  duration={4000}
/>
```

### Loading Screen with Custom Styling
```javascript
<LoadingScreen
  videoSource={require('./assets/loading-video.mp4')}
  onLoadingComplete={() => setLoading(false)}
  overlayText="Welcome to KMIT PR"
  overlayTextStyle={{
    fontSize: 24,
    color: '#00ff88',
    fontWeight: 'bold'
  }}
  backgroundColor="#1a1a1a"
/>
```

### Simple Animated Loading
```javascript
<SimpleLoadingScreen
  onLoadingComplete={() => setLoading(false)}
  overlayText="KMIT PR"
  showProgress={true}
  logoSource={require('./assets/pr-logo.png')}
/>
```

## Troubleshooting

### Video Not Playing
1. Check if `expo-av` is installed: `npx expo install expo-av`
2. Verify video file path is correct
3. Ensure video format is supported (MP4 with H.264)
4. Check if fallback component appears (indicates video loading issue)

### Performance Issues
1. Reduce video file size
2. Use lower resolution video
3. Consider using SimpleLoadingScreen for better performance

### Android-Specific Issues
1. Test video playback on Android devices
2. Some Android devices may have codec limitations
3. Ensure video is optimized for mobile playback

## Integration with Navigation

If using React Navigation, integrate the loading screen at the root level:

```javascript
import { NavigationContainer } from '@react-navigation/native';
import { LoadingScreen } from './src/components';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <LoadingScreen
        videoSource={require('./assets/loading-video.mp4')}
        onLoadingComplete={() => setIsLoading(false)}
      />
    );
  }

  return (
    <NavigationContainer>
      {/* Your navigation stack */}
    </NavigationContainer>
  );
}
```

This setup ensures the loading screen appears before any navigation occurs.