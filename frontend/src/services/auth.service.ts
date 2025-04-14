/**
 * Authentication service
 * 
 * This service is responsible for handling authentication-related functionality,
 * including storing and retrieving authentication tokens, as well as services
 * related to the API endpoints that start with /auth.
 * 
 * Note that this file should not import api.utils.ts.
 */

/**
 * Gets the authentication token from localStorage
 * This is a stub that will be replaced with the actual implementation
 * This function is required by api.utils.ts to make authenticated API requests
 */
export const getAuthToken = (): string | null => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return null;
  return localStorage.getItem(`token_${currentUser}`);
};

// get the highest role that the user has
export const getUserRole = (): string | null => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return null;
  return localStorage.getItem(`role_${currentUser}`);
};

// get the current role that the user is using
export const getCurrentRole = (): string | null => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return null;
  return localStorage.getItem(`current_role_${currentUser}`);
};

// set the current role that the user is using
export const setCurrentRole = (role: string): void => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return;
  localStorage.setItem(`current_role_${currentUser}`, role);
};

// get the user name
export const getUserName = (): string | null => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return null;
  return localStorage.getItem(`userName_${currentUser}`);
};

export const getUserId = (): string | null => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return null;
  return localStorage.getItem(`userId_${currentUser}`);
};

export const getUserExpiresAt = (): string | null => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return null;
  return localStorage.getItem(`resetExpiresAt_${currentUser}`);
};

export const getUserUtorid = (): string | null => {
  const currentUser = localStorage.getItem('currentUser');
  return currentUser;
};

export const logout = (): void => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return;
  localStorage.removeItem('currentUser');
  localStorage.removeItem(`token_${currentUser}`);
  localStorage.removeItem(`role_${currentUser}`);
  localStorage.removeItem(`current_role_${currentUser}`);
  localStorage.removeItem(`userId_${currentUser}`);
  localStorage.removeItem(`resetExpiresAt_${currentUser}`);
  localStorage.removeItem(`userName_${currentUser}`);
};

export const isUserVerified = (): boolean => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return false;
  
  const verifiedValue = localStorage.getItem(`verified_${currentUser}`);
  console.log(`Verification status for ${currentUser}: ${verifiedValue}`);
  
  // Handle different string representations of boolean values
  return verifiedValue === 'true' || verifiedValue === '1' || verifiedValue === 'yes';
};

// TODO: update user state (call user/me to update all states stored in localStorage)
