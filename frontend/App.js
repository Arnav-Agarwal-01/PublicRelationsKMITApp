/**
 * Main App component for KMIT Events App
 * Handles authentication flow and app initialization
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import { colors } from './src/theme/colors';
import { isAuthenticated } from './src/services/authService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check if user is already authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle successful login
   * @param {Object} loginResponse - Response from login API
   */
  const handleLoginSuccess = (loginResponse) => {
    console.log('Login successful, user data:', loginResponse.user);
    
    setUser(loginResponse.user);
    setIsLoggedIn(true);

    // Check if user needs to change password
    if (loginResponse.user && !loginResponse.user.isPasswordChanged) {
      Alert.alert(
        'Password Change Required',
        'You need to change your password before continuing.',
        [{ text: 'OK', style: 'default' }]
      );
      // TODO: Navigate to password change screen (will be implemented in next task)
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" backgroundColor={colors.primary} />
      </View>
    );
  }

  // Show login screen if not authenticated
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </View>
    );
  }

  // TODO: Show main app screens when authenticated
  // For now, just show a placeholder
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.primary} />
      {/* TODO: Add main app navigation and screens */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
