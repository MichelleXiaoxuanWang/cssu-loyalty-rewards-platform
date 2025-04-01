/**
 * API configuration
 * 
 * This file centralizes API URL configuration across the application.
 */

// Base API URL - falls back to localhost if env variable isn't set
const getApiUrl = () => {
  // @ts-ignore - Vite exposes env variables this way but TypeScript definition is missing
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    // @ts-ignore
    return import.meta.env.VITE_API_URL;
  }
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiUrl(); 