import { API_BASE_URL } from '../config/api.config';
import { getAuthToken } from '../services/auth.service';

/**
 * API error class for handling API errors
 */
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Basic API utility to handle requests and responses
 * 
 * Note that this function only handles requests that require authentication. 
 * This function should not be used for endpoints that do not require 
 * authentication (i.e., any endpoints that start with /auth),
 * and this file should not be imported by auth.service.ts.
 * 
 * @param endpoint - The API endpoint (without base URL, e.g., /users)
 * @param method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param payload - Data to send (will be sent as query params for GET, or JSON request body for others)
 * @param options - Additional fetch options. Normally not needed to be provided.
 * @returns Promise with the JSON response
 */
export const apiCall = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  payload?: any,
  options?: RequestInit
): Promise<T> => {
  // Construct the full URL
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Set up headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Default request options
  const requestOptions: RequestInit = {
    method,
    credentials: 'include',
    ...options,
    // Ensure headers are properly merged
    headers: {
      ...headers,
      ...(options?.headers || {})
    }
  };

  // For GET requests, append payload as query parameters
  if (method === 'GET' && payload) {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      // Include undefined check but allow null values to be sent as empty string (null for event capacity means no limit)
      if (value !== undefined) {
        params.append(key, value === null ? '' : String(value));
      }
    });
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  } 
  // For other methods, add payload to request body
  else if (payload && method !== 'GET') {
    requestOptions.body = JSON.stringify(payload);
  }

  try {
    // Make the request
    const response = await fetch(url, requestOptions);
    
    // Handle error responses
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      // Special handling for authentication errors
      if (response.status === 401) {
        // TODO: Trigger a logout action or redirect to login here
        console.log('Authentication failed. Redirecting to login...');
      }
      
      throw new ApiError(errorMessage, response.status);
    }
    
    // For 204 No Content, return empty object
    if (response.status === 204) {
      return {} as T;
    }
    
    // Parse and return JSON response (success)
    return await response.json();
  } catch (error) {
    // Re-throw ApiErrors
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Convert other errors to ApiError
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
};