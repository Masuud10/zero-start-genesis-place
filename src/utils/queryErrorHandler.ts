import { PostgrestError } from '@supabase/supabase-js';

export interface QueryErrorDetails {
  message: string;
  code?: string;
  isNetworkError: boolean;
  isAuthError: boolean;
  isPermissionError: boolean;
  isNotFound: boolean;
}

interface ErrorWithMessage {
  message?: string;
  code?: string;
  name?: string;
}

export const analyzeQueryError = (error: unknown): QueryErrorDetails => {
  const details: QueryErrorDetails = {
    message: 'An unknown error occurred',
    isNetworkError: false,
    isAuthError: false,
    isPermissionError: false,
    isNotFound: false,
  };

  if (!error) {
    return details;
  }

  const errorObj = error as ErrorWithMessage;

  // Handle Supabase PostgrestError
  if (errorObj.code && errorObj.message) {
    const pgError = error as PostgrestError;
    details.code = pgError.code;
    details.message = pgError.message;

    // Common error patterns
    if (pgError.code === 'PGRST301') {
      details.isNotFound = true;
      details.message = 'The requested data was not found';
    } else if (pgError.code === 'PGRST204') {
      details.isNotFound = true;
      details.message = 'No data found for the given criteria';
    } else if (pgError.code === 'PGRST116') {
      details.isPermissionError = true;
      details.message = 'You do not have permission to access this data';
    } else if (pgError.code === 'PGRST103') {
      details.isAuthError = true;
      details.message = 'Authentication required';
    }

    return details;
  }

  // Handle network errors
  if (errorObj.name === 'TypeError' && errorObj.message?.includes('fetch')) {
    details.isNetworkError = true;
    details.message = 'Network connection error. Please check your internet connection.';
    return details;
  }

  // Handle generic JavaScript errors
  if (errorObj.message) {
    details.message = errorObj.message;
    
    // Check for common error patterns
    if (errorObj.message.includes('unauthorized') || errorObj.message.includes('authentication')) {
      details.isAuthError = true;
    } else if (errorObj.message.includes('permission') || errorObj.message.includes('forbidden')) {
      details.isPermissionError = true;
    } else if (errorObj.message.includes('timeout') || errorObj.message.includes('network')) {
      details.isNetworkError = true;
    }
  }

  return details;
};

export const getErrorMessage = (error: unknown, fallbackMessage: string = 'An error occurred'): string => {
  const details = analyzeQueryError(error);
  return details.message || fallbackMessage;
};

export const isRetryableError = (error: unknown): boolean => {
  const details = analyzeQueryError(error);
  // Retry on network errors but not on auth/permission errors
  return details.isNetworkError && !details.isAuthError && !details.isPermissionError;
};