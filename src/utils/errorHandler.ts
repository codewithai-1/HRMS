type ApiError = {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
};

/**
 * Standard error handler for API responses
 * @param error The error object from API response or catch block
 * @returns Standardized error object with user-friendly message
 */
export const handleApiError = (error: unknown): ApiError => {
  // Default error message
  let message = 'An unexpected error occurred. Please try again.';
  let status: number | undefined = undefined;
  let code: string | undefined = undefined;
  let errors: Record<string, string[]> | undefined = undefined;

  // Handle network errors
  if (error instanceof Error) {
    if ('code' in error && error.code === 'ECONNABORTED') {
      message = 'Request timed out. Please check your connection and try again.';
    } else if ('response' in error) {
      // Axios error response
      const responseError = error as any;
      status = responseError.response?.status;

      // Handle different status codes
      if (status === 401) {
        message = 'Authentication failed. Please login again.';
      } else if (status === 403) {
        message = 'You don\'t have permission to perform this action.';
      } else if (status === 404) {
        message = 'The requested resource was not found.';
      } else if (status === 422) {
        message = 'Validation failed. Please check your inputs.';
        errors = responseError.response?.data?.errors;
      } else if (status !== undefined && status >= 500) {
        message = 'Server error. Please try again later.';
      } else if (responseError.response?.data?.message) {
        message = responseError.response.data.message;
      }
      
      code = responseError.response?.data?.code;
    } else {
      // Regular error object
      message = error.message || message;
    }
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = (error as any).message;
    
    if ('code' in error) {
      code = (error as any).code;
    }
    
    if ('status' in error) {
      status = (error as any).status;
    }
    
    if ('errors' in error) {
      errors = (error as any).errors;
    }
  }

  return { message, code, status, errors };
};

/**
 * Get field error message from validation errors
 * @param fieldName The name of the field to get error for
 * @param errors The errors object from handleApiError
 * @returns First error message for the field or undefined
 */
export const getFieldError = (
  fieldName: string, 
  errors?: Record<string, string[]>
): string | undefined => {
  if (!errors || !errors[fieldName] || !errors[fieldName].length) {
    return undefined;
  }
  
  return errors[fieldName][0];
};

export default {
  handleApiError,
  getFieldError
}; 