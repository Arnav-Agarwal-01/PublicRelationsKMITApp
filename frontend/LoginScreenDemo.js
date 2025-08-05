/**
 * Demo component to test the LoginScreen implementation
 * This demonstrates the login screen with all its features
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import { colors } from './src/theme/colors';
import { typography } from './src/theme/typography';
import { spacing } from './src/theme/spacing';

const LoginScreenDemo = () => {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (response) => {
    console.log('Login successful in demo:', response);
    setUser(response.user);
    
    // Show success message
    Alert.alert(
      'Login Successful!',
      `Welcome ${response.user.name}!\nRole: ${response.user.role}\nPassword Changed: ${response.user.isPasswordChanged ? 'Yes' : 'No'}`,
      [
        {
          text: 'Continue',
          onPress: () => {
            // In a real app, this would navigate to the main app
            console.log('User would be navigated to main app');
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (user) {
    return (
      <View style={styles.container}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          <Text style={styles.welcomeText}>Name: {user.name}</Text>
          <Text style={styles.welcomeText}>Role: {user.role}</Text>
          {user.rollNumber && (
            <Text style={styles.welcomeText}>Roll Number: {user.rollNumber}</Text>
          )}
          {user.clubName && (
            <Text style={styles.welcomeText}>Club: {user.clubName}</Text>
          )}
          <Text style={styles.welcomeText}>
            Password Changed: {user.isPasswordChanged ? 'Yes' : 'No'}
          </Text>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  welcomeContainer: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  welcomeTitle: {
    ...typography.h1,
    color: colors.accent,
    marginBottom: spacing.lg,
  },
  welcomeText: {
    ...typography.body1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 16,
  },
});

export default LoginScreenDemo;