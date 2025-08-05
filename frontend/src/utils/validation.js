/**
 * Form validation utilities
 * Provides common validation functions for forms
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, message: 'Password is strong' };
};

/**
 * Validate roll number format
 * @param {string} rollNumber - Roll number to validate
 * @returns {boolean} - True if valid roll number format
 */
export const isValidRollNumber = (rollNumber) => {
  if (!rollNumber) return false;
  // Allow alphanumeric characters, typically 6-12 characters
  const rollRegex = /^[A-Za-z0-9]{6,12}$/;
  return rollRegex.test(rollNumber.trim());
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid name format
 */
export const isValidName = (name) => {
  if (!name) return false;
  // Allow letters, spaces, and common name characters, 2-50 characters
  const nameRegex = /^[A-Za-z\s\-\.]{2,50}$/;
  return nameRegex.test(name.trim());
};

/**
 * Validate club name format
 * @param {string} clubName - Club name to validate
 * @returns {boolean} - True if valid club name format
 */
export const isValidClubName = (clubName) => {
  if (!clubName) return false;
  // Allow letters, numbers, spaces, and common punctuation, 2-100 characters
  const clubRegex = /^[A-Za-z0-9\s\-\.\&]{2,100}$/;
  return clubRegex.test(clubName.trim());
};