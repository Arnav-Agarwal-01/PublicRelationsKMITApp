/**
 * LoginScreen Component Tests
 * 
 * Tests for the login screen functionality including:
 * - Component rendering
 * - Form validation
 * - User type switching
 * - Authentication flow
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

// Mock the auth service
jest.mock('../../services/authService', () => ({
  loginUser: jest.fn(),
}));

// Mock expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

describe('LoginScreen', () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
    );

    // Check if main elements are present
    expect(getByText('Welcome to')).toBeTruthy();
    expect(getByText('KMIT Events')).toBeTruthy();
    expect(getByText('Student')).toBeTruthy();
    expect(getByText('Council')).toBeTruthy();
    expect(getByPlaceholderText('Enter your full name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your roll number')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('switches between student and council forms', () => {
    const { getByText, getByPlaceholderText, queryByPlaceholderText } = render(
      <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
    );

    // Initially should show student form
    expect(getByPlaceholderText('Enter your full name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your roll number')).toBeTruthy();

    // Switch to council
    fireEvent.press(getByText('Council'));

    // Should now show council form
    expect(getByPlaceholderText('Enter your full name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your club name')).toBeTruthy();
    expect(queryByPlaceholderText('Enter your roll number')).toBeFalsy();
  });

  it('validates required fields for student login', async () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
    );

    // Try to submit without filling fields
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(getByText('Name is required')).toBeTruthy();
      expect(getByText('Roll number is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('validates required fields for council login', async () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
    );

    // Switch to council
    fireEvent.press(getByText('Council'));

    // Try to submit without filling fields
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(getByText('Club name is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('clears form when switching user types', () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
    );

    // Fill student form
    fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'Test Student');
    fireEvent.changeText(getByPlaceholderText('Enter your roll number'), 'TEST001');

    // Switch to council
    fireEvent.press(getByText('Council'));

    // Switch back to student
    fireEvent.press(getByText('Student'));

    // Form should be cleared
    expect(getByPlaceholderText('Enter your full name').props.value).toBe('');
    expect(getByPlaceholderText('Enter your roll number').props.value).toBe('');
  });

  it('handles successful login', async () => {
    const { loginUser } = require('../../services/authService');
    const mockResponse = {
      user: {
        id: '123',
        name: 'Test Student',
        role: 'student',
        isPasswordChanged: true,
      },
      token: 'mock-token',
    };

    loginUser.mockResolvedValueOnce(mockResponse);

    const { getByText, getByPlaceholderText } = render(
      <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
    );

    // Fill form
    fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'Test Student');
    fireEvent.changeText(getByPlaceholderText('Enter your roll number'), 'TEST001');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Kmit123$');

    // Submit form
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        userType: 'student',
        name: 'Test Student',
        rollNumber: 'TEST001',
        password: 'Kmit123$',
      });
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });
});