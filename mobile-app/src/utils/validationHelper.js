/**
 * Common validation rules for TruthLens
 */

/**
 * Validates password strength
 * Rules: min 8 characters, at least 1 number, at least 1 special character
 */
export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'Password is required' };
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  const hasNumber = /\d/.test(password);
  if (!hasNumber) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasSpecial) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true };
};
