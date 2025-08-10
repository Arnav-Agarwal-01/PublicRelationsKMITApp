/**
 * LoadingScreen Component
 * 
 * A full-screen loading component that plays an MP4 video
 * Can be used as a splash screen or loading indicator
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({
  videoSource,
  onLoadingComplete,
  showFallback = true,
  fallbackText = "Loading...",
  autoHide = true,
  duration = 3000, // Auto hide after 3 seconds
  backgroundColor = '#000000',
  overlayText,
  overlayTextStyle,
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (autoHide && duration > 0) {
      const timer = setTimeout(() => {
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onLoadingComplete]);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const handleVideoError = (error) => {
    console.warn('Video loading error:', error);
    setVideoError(true);
  };

  const handleVideoEnd = () => {
    if (onLoadingComplete) {
      onLoadingComplete();
    }
  };

  // Fallback component when video fails to load
  const FallbackComponent = () => (
    <View style={[styles.container, { backgroundColor }]}>
      <ActivityIndicator size="large" color="#00ff88" />
      <Text style={styles.fallbackText}>{fallbackText}</Text>
    </View>
  );

  // Show fallback if video error and fallback is enabled
  if (videoError && showFallback) {
    return <FallbackComponent />;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {videoSource && (
        <Video
          source={videoSource}
          style={styles.video}
          shouldPlay
          isLooping={false}
          resizeMode="cover"
          onLoad={handleVideoLoad}
          onError={handleVideoError}
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              handleVideoEnd();
            }
          }}
        />
      )}
      
      {/* Show loading indicator until video loads */}
      {!isVideoLoaded && !videoError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00ff88" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}

      {/* Optional overlay text */}
      {overlayText && (
        <View style={styles.textOverlay}>
          <Text style={[styles.overlayText, overlayTextStyle]}>
            {overlayText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  video: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  fallbackText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default LoadingScreen;