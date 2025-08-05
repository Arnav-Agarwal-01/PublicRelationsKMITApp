/**
 * Authentication service for handling login and user management
 * Connects to the backend API for user authentication
 */

import * as SecureStore from 'expo-secure-store';

import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

/**
 * Store authentication token securely
 * @param {string} token - JWT token from backend
 */
export const storeToken = async (token) => {
  try {
    await SecureStore.setItemAsync('authToken', token);
  } catch (error) {
    console.error('Error storing token:', error);
    throw new Error('Failed to store authentication token');
  }
};

/**
 * Retrieve stored authentication token
 * @returns {string|null} - JWT token or null if not found
 */
export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync('authToken');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Remove stored authentication token (logout)
 */
export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync('authToken');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Login user with credentials
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.userType - 'student' or 'council'
 * @param {string} credentials.name - User's name (for students)
 * @param {string} credentials.rollNumber - Student's roll number (for students)
 * @param {string} credentials.clubName - Club name (for council members)
 * @param {string} credentials.password - User's password
 * @returns {Object} - Login response with user data and token
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Login failed');
    }

    if (data.data?.token) {
      await storeToken(data.data.token);
    }

    return data.data;
  } catch (error) {
    if (error.message === 'Network request failed' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw error;
  }
};

/**
 * Change user password
 * @param {string} newPassword - New password
 * @returns {Object} - Password change response
 */
export const changePassword = async (newPassword) => {
  const token = await getToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Password change failed');
  }

  return data;
};

/**
 * Verify if user is authenticated
 * @returns {boolean} - True if user has valid token
 */
export const isAuthenticated = async () => {
  try {
    const token = await getToken();
    return !!token;
  } catch {
    return false;
  }
};