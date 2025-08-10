/**
 * LoadingExample Component
 * 
 * Example implementation showing how to use the loading components
 * with your MP4 file
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import LoadingScreen from './LoadingScreen';
import SimpleLoadingScreen from './SimpleLoadingScreen';

const LoadingExample = ({ onComplete }) => {
  const [showLoading, setShowLoading] = useState(true);
  const [useVideoLoading, setUseVideoLoading] = useState(true);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!showLoading) {
    return null;
  }

  // Example with MP4 video (requires expo-av)
  if (useVideoLoading) {
    return (
      <LoadingScreen
        // Replace with your MP4 file path
        videoSource={require('../../assets/loading-video.mp4')}
        onLoadingComplete={handleLoadingComplete}
        autoHide={true}
        duration={5000} // 5 seconds
        backgroundColor="#000000"
        overlayText="KMIT PR"
        overlayTextStyle={styles.overlayText}
        showFallback={true}
        fallbackText="Loading KMIT PR App..."
      />
    );
  }

  // Fallback to simple loading screen
  return (
    <SimpleLoadingScreen
      onLoadingComplete={handleLoadingComplete}
      duration={3000}
      backgroundColor="#000000"
      overlayText="KMIT PR"
      showProgress={true}
      // logoSource={require('../../assets/pr-logo.png')} // Optional logo
    />
  );
};

const styles = StyleSheet.create({
  overlayText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff88',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

export default LoadingExample;