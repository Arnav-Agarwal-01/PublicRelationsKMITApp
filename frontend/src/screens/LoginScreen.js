/**
 * Login Screen with dual authentication (Student/Council)
 * Modern dark theme with smooth animations and form validation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import Button from '../components/Button';
import Input from '../components/Input';
import ToggleSwitch from '../components/ToggleSwitch';
import { loginUser } from '../services/authService';
import { isValidName, isValidRollNumber, isValidClubName } from '../utils/validation';

const LoginScreen = ({ onLoginSuccess }) => {
  // Form state
  const [userType, setUserType] = useState(0); // 0 = Student, 1 = Council
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    clubName: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleUserTypeToggle = (index) => {
    setUserType(index);
    setFormData({ name: '', rollNumber: '', clubName: '', password: '' });
    setErrors({});
  };

  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { name, rollNumber, clubName, password } = formData;
    
    // Common validation
    if (!name.trim()) newErrors.name = 'Name is required';
    else if (!isValidName(name.trim())) newErrors.name = 'Please enter a valid name';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    // Type-specific validation
    if (userType === 0) {
      if (!rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
      else if (!isValidRollNumber(rollNumber.trim())) newErrors.rollNumber = 'Please enter a valid roll number';
    } else {
      if (!clubName.trim()) newErrors.clubName = 'Club name is required';
      else if (!isValidClubName(clubName.trim())) newErrors.clubName = 'Please enter a valid club name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const credentials = {
        userType: userType === 0 ? 'student' : 'council',
        name: formData.name.trim(),
        password: formData.password,
      };

      if (userType === 0) {
        credentials.rollNumber = formData.rollNumber.trim();
      } else {
        credentials.clubName = formData.clubName.trim();
      }

      const response = await loginUser(credentials);
      onLoginSuccess?.(response);
      
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.primary} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to</Text>
              <Text style={styles.subtitle}>KMIT Events</Text>
              <Text style={styles.description}>
                Sign in to access college events and club activities
              </Text>
            </View>

            {/* User Type Toggle */}
            <ToggleSwitch
              options={['Student', 'Council']}
              selectedIndex={userType}
              onToggle={handleUserTypeToggle}
              style={styles.toggle}
            />

            {/* Form Fields */}
            <View style={styles.form}>
              <Input
                label="Full Name"
                value={formData.name}
                onChangeText={(value) => updateFormField('name', value)}
                placeholder="Enter your full name"
                error={errors.name}
                autoCapitalize="words"
              />
              
              {userType === 0 ? (
                <Input
                  label="Roll Number"
                  value={formData.rollNumber}
                  onChangeText={(value) => updateFormField('rollNumber', value)}
                  placeholder="Enter your roll number"
                  error={errors.rollNumber}
                  autoCapitalize="characters"
                />
              ) : (
                <Input
                  label="Club Name"
                  value={formData.clubName}
                  onChangeText={(value) => updateFormField('clubName', value)}
                  placeholder="Enter your club name"
                  error={errors.clubName}
                  autoCapitalize="words"
                />
              )}
              
              <Input
                label="Password"
                value={formData.password}
                onChangeText={(value) => updateFormField('password', value)}
                placeholder="Enter your password"
                error={errors.password}
                secureTextEntry
              />
            </View>

            {/* Login Button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
            />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Having trouble signing in?
              </Text>
              <Text style={styles.footerSubtext}>
                Contact your administrator for assistance
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typography.h2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.h1,
    color: colors.accent,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  description: {
    ...typography.body2,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  toggle: {
    marginBottom: spacing.xl,
  },
  form: {
    marginBottom: spacing.xl,
  },
  loginButton: {
    marginBottom: spacing.xl,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  footerText: {
    ...typography.body2,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },

});

export default LoginScreen;