import { ApiError } from './api.utils';

/**
 * Displays an error message to the user using browser's alert.
 * If it's an API error, displays the server message.
 * If it's another error, displays a user-friendly message.
 */
export const handleError = (error: unknown): void => {
  if (error instanceof ApiError) {
    // Display the error message from the backend
    alert(error.message);
  } else if (error instanceof Error) {
    // For other Error instances, display their message
    alert(error.message);
  } else {
    // For unknown errors, display a generic message
    alert('An unexpected error occurred. Please try again.');
  }
};

/**
 * Wraps an async function with standardized error handling.
 * Use this as a higher-order function for any async operations that need error handling.
 */
export const withErrorHandler = async <T>(
  operation: () => Promise<T>,
  customErrorHandler?: (error: unknown) => void
): Promise<T | undefined> => {
  try {
    return await operation();
  } catch (error) {
    if (customErrorHandler) {
      customErrorHandler(error);
    } else {
      handleError(error);
    }
  }
}; 