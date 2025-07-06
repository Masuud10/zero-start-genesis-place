import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorDetails {
  message: string;
  code?: string | number;
  statusCode?: number;
  context?: string;
  retry?: () => void;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const logError = useCallback((error: Error | string, context?: string) => {
    const timestamp = new Date().toISOString();
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'object' ? error.stack : undefined;

    console.error(`🚨 [${timestamp}] Error in ${context || 'unknown context'}:`, {
      message: errorMessage,
      stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 50)
    });

    // In production, this could send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTrackingService.log({ error, context, timestamp });
    }
  }, []);

  const handleError = useCallback((error: Error | ErrorDetails | string, showToast = true) => {
    let errorDetails: ErrorDetails;

    if (typeof error === 'string') {
      errorDetails = { message: error };
    } else if (error instanceof Error) {
      errorDetails = { 
        message: error.message,
        context: 'JavaScript Error'
      };
    } else {
      errorDetails = error;
    }

    // Log the error
    logError(errorDetails.message, errorDetails.context);

    // Determine user-friendly message based on error type
    let userMessage = errorDetails.message;
    let title = 'Error';
    const variant: 'default' | 'destructive' = 'destructive';

    // Parse common error patterns
    const message = errorDetails.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch failed') || message.includes('failed to fetch')) {
      title = 'Connection Error';
      userMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else if (message.includes('401') || message.includes('unauthorized')) {
      title = 'Access Denied';
      userMessage = 'You are not authorized to perform this action. Please log in again.';
    } else if (message.includes('403') || message.includes('forbidden')) {
      title = 'Permission Denied';
      userMessage = 'You do not have permission to access this resource.';
    } else if (message.includes('404') || message.includes('not found')) {
      title = 'Not Found';
      userMessage = 'The requested resource could not be found.';
    } else if (message.includes('500') || message.includes('internal server error')) {
      title = 'Server Error';
      userMessage = 'A server error occurred. Please try again later.';
    } else if (message.includes('timeout')) {
      title = 'Request Timeout';
      userMessage = 'The request took too long to complete. Please try again.';
    } else if (message.includes('validation') || message.includes('invalid')) {
      title = 'Validation Error';
      userMessage = 'Please check your input and try again.';
    } else if (message.includes('duplicate') || message.includes('already exists')) {
      title = 'Duplicate Entry';
      userMessage = 'This entry already exists. Please use a different value.';
    } else if (errorDetails.statusCode && errorDetails.statusCode >= 400) {
      title = `Error ${errorDetails.statusCode}`;
      userMessage = `Server returned error ${errorDetails.statusCode}. Please try again.`;
    }

    // Show toast notification if requested
    if (showToast) {
      toast({
        title,
        description: userMessage,
        variant,
      });
    }

    return {
      title,
      message: userMessage,
      originalError: errorDetails,
    };
  }, [toast, logError]);

  const handleApiError = useCallback((error: any, context: string, retryFn?: () => void) => {
    let errorDetails: ErrorDetails = {
      message: 'An unexpected error occurred',
      context,
      retry: retryFn
    };

    // Handle different types of API errors
    if (error?.response) {
      // Axios-style error with response
      errorDetails = {
        message: error.response.data?.message || error.response.statusText || 'Server error',
        statusCode: error.response.status,
        code: error.response.data?.code,
        context,
        retry: retryFn
      };
    } else if (error?.message) {
      // Standard Error object
      errorDetails = {
        message: error.message,
        context,
        retry: retryFn
      };
    } else if (typeof error === 'string') {
      // String error
      errorDetails = {
        message: error,
        context,
        retry: retryFn
      };
    }

    return handleError(errorDetails);
  }, [handleError]);

  const handleSupabaseError = useCallback((error: any, context: string, retryFn?: () => void) => {
    let message = 'Database operation failed';

    if (error?.message) {
      message = error.message;
      
      // Handle common Supabase error patterns
      if (message.includes('row-level security')) {
        message = 'You do not have permission to access this data';
      } else if (message.includes('duplicate key')) {
        message = 'This record already exists';
      } else if (message.includes('foreign key')) {
        message = 'Cannot delete this record because it is referenced by other data';
      } else if (message.includes('not null')) {
        message = 'Required fields are missing';
      } else if (message.includes('unique constraint')) {
        message = 'A record with this information already exists';
      }
    }

    return handleApiError({
      message,
      code: error?.code,
      details: error?.details
    }, context, retryFn);
  }, [handleApiError]);

  return {
    handleError,
    handleApiError,
    handleSupabaseError,
    logError
  };
};

export default useErrorHandler;