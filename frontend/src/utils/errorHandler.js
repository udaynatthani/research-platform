/**
 * Semantic error handler to convert raw API errors into user-friendly messages.
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';

  // If it's a string, just return it
  if (typeof error === 'string') return error;

  // Handle Axios/Response errors
  if (error.response) {
    const { data, status } = error.response;
    
    // Check for explicit error message from backend
    if (data && data.error) {
      const errorStr = typeof data.error === 'string' ? data.error : (data.error.message || '');
      
      // Mask Prisma / Database errors
      if (errorStr.includes('Prisma') || errorStr.includes('invocation') || errorStr.includes('constraint') || errorStr.includes('ConnectorError')) {
        return 'A database error occurred. Please try again or contact support if the issue persists.';
      }

      if (typeof data.error === 'string') return data.error;
      if (data.error.message) return data.error.message;
    }


    // Handle specific status codes
    switch (status) {
      case 400: return 'Invalid request. Please check your input.';
      case 401: return 'Authentication required. Please log in again.';
      case 403: return 'You do not have permission to perform this action.';
      case 404: return 'The requested resource was not found.';
      case 429: return 'Too many requests. Please try again later.';
      case 500: return 'Internal server error. Our team has been notified.';
      default: return `Error: ${status}. Something went wrong on the server.`;
    }
  }

  // Handle network issues
  if (error.request) {
    return 'Network error. Please check your internet connection and ensure the backend is running.';
  }

  // Handle other types of errors
  return error.message || 'An unexpected error occurred.';
};
