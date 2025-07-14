import { toast } from '@/hooks/use-toast';
import { auditLogger } from './auditLogger';

export interface ErrorContext {
  action: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorDetails {
  message: string;
  code?: string;
  statusCode?: number;
  isNetworkError?: boolean;
  isAuthError?: boolean;
  isPermissionError?: boolean;
  isValidationError?: boolean;
  isDatabaseError?: boolean;
  retryable?: boolean;
}

export class UnifiedErrorHandler {
  private static readonly ERROR_TYPES = {
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    VALIDATION: 'validation',
    NETWORK: 'network',
    DATABASE: 'database',
    SYSTEM: 'system',
    UNKNOWN: 'unknown'
  } as const;

  /**
   * Handle any error with consistent logging and user feedback
   */
  static handleError(
    error: unknown,
    context: ErrorContext,
    options: {
      showToast?: boolean;
      logToAudit?: boolean;
      retryable?: boolean;
    } = {}
  ): ErrorDetails {
    const {
      showToast = true,
      logToAudit = true,
      retryable = false
    } = options;

    // Parse error into standardized format
    const errorDetails = this.parseError(error);
    errorDetails.retryable = retryable;

    // Log error for debugging
    console.error(`❌ Error in ${context.action}:`, {
      error: errorDetails,
      context,
      timestamp: new Date().toISOString()
    });

    // Log to audit system if enabled
    if (logToAudit) {
      this.logToAudit(errorDetails, context);
    }

    // Show user-friendly toast if enabled
    if (showToast) {
      this.showUserToast(errorDetails);
    }

    return errorDetails;
  }

  /**
   * Parse any error into standardized format
   */
  private static parseError(error: unknown): ErrorDetails {
    if (!error) {
      return {
        message: 'An unknown error occurred',
        isNetworkError: false,
        isAuthError: false,
        isPermissionError: false,
        isValidationError: false,
        isDatabaseError: false
      };
    }

    const errorObj = error as Record<string, unknown>;
    const message = (typeof errorObj?.message === 'string' ? errorObj.message : String(error));
    const lowerMessage = (typeof message === 'string' ? message : String(message)).toLowerCase();

    // Determine error type
    let errorType: string = this.ERROR_TYPES.UNKNOWN;
    let isNetworkError = false;
    let isAuthError = false;
    let isPermissionError = false;
    let isValidationError = false;
    let isDatabaseError = false;

    // Network errors
    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('fetch') ||
      lowerMessage.includes('timeout') ||
      lowerMessage.includes('connection') ||
      errorObj?.name === 'TypeError' ||
      errorObj?.code === 'NETWORK_ERROR'
    ) {
      errorType = this.ERROR_TYPES.NETWORK;
      isNetworkError = true;
    }
    // Authentication errors
    else if (
      lowerMessage.includes('auth') ||
      lowerMessage.includes('unauthorized') ||
      lowerMessage.includes('401') ||
      lowerMessage.includes('session') ||
      lowerMessage.includes('login') ||
      errorObj?.status === 401
    ) {
      errorType = this.ERROR_TYPES.AUTHENTICATION;
      isAuthError = true;
    }
    // Authorization errors
    else if (
      lowerMessage.includes('permission') ||
      lowerMessage.includes('forbidden') ||
      lowerMessage.includes('403') ||
      lowerMessage.includes('access denied') ||
      errorObj?.status === 403
    ) {
      errorType = this.ERROR_TYPES.AUTHORIZATION;
      isPermissionError = true;
    }
    // Validation errors
    else if (
      lowerMessage.includes('validation') ||
      lowerMessage.includes('invalid') ||
      lowerMessage.includes('required') ||
      lowerMessage.includes('422') ||
      errorObj?.status === 422
    ) {
      errorType = this.ERROR_TYPES.VALIDATION;
      isValidationError = true;
    }
    // Database errors
    else if (
      lowerMessage.includes('database') ||
      lowerMessage.includes('sql') ||
      lowerMessage.includes('pgrst') ||
      lowerMessage.includes('constraint') ||
      (typeof errorObj?.code === 'string' && errorObj.code.startsWith('PGRST'))
    ) {
      errorType = this.ERROR_TYPES.DATABASE;
      isDatabaseError = true;
    }

    return {
      message: this.getUserFriendlyMessage(message, errorType),
      code: typeof errorObj?.code === 'string' ? errorObj.code : undefined,
      statusCode: typeof errorObj?.status === 'number' ? errorObj.status : undefined,
      isNetworkError,
      isAuthError,
      isPermissionError,
      isValidationError,
      isDatabaseError
    };
  }

  /**
   * Get user-friendly error message
   */
  private static getUserFriendlyMessage(message: string, errorType: string): string {
    const lowerMessage = message.toLowerCase();

    switch (errorType) {
      case this.ERROR_TYPES.AUTHENTICATION:
        if (lowerMessage.includes('session expired')) {
          return 'Your session has expired. Please log in again.';
        }
        if (lowerMessage.includes('invalid credentials')) {
          return 'Invalid email or password. Please check your credentials.';
        }
        return 'Authentication failed. Please log in again.';

      case this.ERROR_TYPES.AUTHORIZATION:
        return 'You do not have permission to perform this action.';

      case this.ERROR_TYPES.VALIDATION:
        // Return the original validation message as it's usually user-friendly
        return message;

      case this.ERROR_TYPES.NETWORK:
        if (lowerMessage.includes('timeout')) {
          return 'Request timed out. Please check your internet connection and try again.';
        }
        return 'Network connection error. Please check your internet connection.';

      case this.ERROR_TYPES.DATABASE:
        if (lowerMessage.includes('duplicate')) {
          return 'This record already exists. Please use a different value.';
        }
        if (lowerMessage.includes('constraint')) {
          return 'Invalid data provided. Please check your input.';
        }
        return 'Database error occurred. Please try again later.';

      case this.ERROR_TYPES.SYSTEM:
        return 'A system error occurred. Please try again later.';

      default:
        // For unknown errors, provide a generic but helpful message
        if (lowerMessage.includes('something went wrong')) {
          return 'An unexpected error occurred. Please try again.';
        }
        return message || 'An unknown error occurred. Please try again.';
    }
  }

  /**
   * Show user-friendly toast notification
   */
  private static showUserToast(errorDetails: ErrorDetails): void {
    const { message, isAuthError, isPermissionError, isNetworkError } = errorDetails;

    let variant: 'default' | 'destructive' = 'destructive';
    let title = 'Error';

    if (isAuthError) {
      title = 'Authentication Error';
    } else if (isPermissionError) {
      title = 'Access Denied';
    } else if (isNetworkError) {
      title = 'Connection Error';
    }

    toast({
      title,
      description: message,
      variant
    });
  }

  /**
   * Log error to audit system
   */
  private static logToAudit(errorDetails: ErrorDetails, context: ErrorContext): void {
    try {
      auditLogger.log({
        action: context.action,
        resource: 'error',
        success: false,
        error_message: errorDetails.message,
        metadata: {
          ...context.metadata,
          errorCode: errorDetails.code,
          errorType: this.getErrorType(errorDetails),
          statusCode: errorDetails.statusCode,
          isRetryable: errorDetails.retryable
        }
      });
    } catch (auditError) {
      console.warn('Failed to log error to audit system:', auditError);
    }
  }

  /**
   * Get error type for audit logging
   */
  private static getErrorType(errorDetails: ErrorDetails): string {
    if (errorDetails.isAuthError) return 'authentication';
    if (errorDetails.isPermissionError) return 'authorization';
    if (errorDetails.isValidationError) return 'validation';
    if (errorDetails.isNetworkError) return 'network';
    if (errorDetails.isDatabaseError) return 'database';
    return 'unknown';
  }

  /**
   * Handle specific error types with custom logic
   */
  static handleAuthError(error: unknown, context: ErrorContext): void {
    this.handleError(error, context, {
      showToast: true,
      logToAudit: true,
      retryable: false
    });
  }

  static handleNetworkError(error: unknown, context: ErrorContext): void {
    this.handleError(error, context, {
      showToast: true,
      logToAudit: true,
      retryable: true
    });
  }

  static handleValidationError(error: unknown, context: ErrorContext): void {
    this.handleError(error, context, {
      showToast: true,
      logToAudit: false, // Don't log validation errors to audit
      retryable: false
    });
  }

  static handleDatabaseError(error: unknown, context: ErrorContext): void {
    this.handleError(error, context, {
      showToast: true,
      logToAudit: true,
      retryable: true
    });
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: unknown): boolean {
    const errorDetails = this.parseError(error);
    return errorDetails.isNetworkError || errorDetails.isDatabaseError;
  }

  /**
   * Get retry delay for error
   */
  static getRetryDelay(error: unknown, attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    return delay + Math.random() * 1000; // Add jitter
  }
}

// Export convenience functions
export const handleError = UnifiedErrorHandler.handleError.bind(UnifiedErrorHandler);
export const handleAuthError = UnifiedErrorHandler.handleAuthError.bind(UnifiedErrorHandler);
export const handleNetworkError = UnifiedErrorHandler.handleNetworkError.bind(UnifiedErrorHandler);
export const handleValidationError = UnifiedErrorHandler.handleValidationError.bind(UnifiedErrorHandler);
export const handleDatabaseError = UnifiedErrorHandler.handleDatabaseError.bind(UnifiedErrorHandler);
export const isRetryableError = UnifiedErrorHandler.isRetryableError.bind(UnifiedErrorHandler);
export const getRetryDelay = UnifiedErrorHandler.getRetryDelay.bind(UnifiedErrorHandler); 