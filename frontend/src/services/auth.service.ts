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
  return localStorage.getItem('token'); // Retrieve the token from localStorage
};