
import { toast } from '@/hooks/use-toast';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  context?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: AppError[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  logError(error: AppError): void {
    this.errors.push(error);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', error);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error);
    }
  }

  private sendToMonitoring(error: AppError): void {
    // Integration with monitoring services like Sentry could go here
    console.log('Sending error to monitoring service:', error);
  }

  handleAuthError(error: any, context: string = 'authentication'): void {
    const appError: AppError = {
      code: 'AUTH_ERROR',
      message: this.getAuthErrorMessage(error),
      details: error,
      timestamp: new Date(),
      context
    };

    this.logError(appError);
    
    toast({
      title: "Authentication Error",
      description: appError.message,
      variant: "destructive",
    });
  }

  handleDatabaseError(error: any, context: string = 'database'): void {
    const appError: AppError = {
      code: 'DB_ERROR',
      message: this.getDatabaseErrorMessage(error),
      details: error,
      timestamp: new Date(),
      context
    };

    this.logError(appError);
    
    toast({
      title: "Data Error",
      description: "Unable to process your request. Please try again.",
      variant: "destructive",
    });
  }

  handleNetworkError(error: any, context: string = 'network'): void {
    const appError: AppError = {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed. Please check your internet connection.',
      details: error,
      timestamp: new Date(),
      context
    };

    this.logError(appError);
    
    toast({
      title: "Connection Error",
      description: appError.message,
      variant: "destructive",
    });
  }

  private getAuthErrorMessage(error: any): string {
    if (error?.message?.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials.';
    }
    if (error?.message?.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in.';
    }
    if (error?.message?.includes('Too many requests')) {
      return 'Too many login attempts. Please wait before trying again.';
    }
    return 'Authentication failed. Please try again.';
  }

  private getDatabaseErrorMessage(error: any): string {
    if (error?.message?.includes('violates row-level security')) {
      return 'Access denied. You do not have permission to access this data.';
    }
    if (error?.message?.includes('duplicate key')) {
      return 'This record already exists.';
    }
    return 'Database operation failed. Please try again.';
  }

  getRecentErrors(): AppError[] {
    return this.errors.slice(-50); // Return last 50 errors
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Helper function for API error handling
export const handleApiError = (error: any, context?: string): void => {
  if (error?.code === 'auth-error') {
    errorHandler.handleAuthError(error, context);
  } else if (error?.code === 'db-error') {
    errorHandler.handleDatabaseError(error, context);
  } else if (error?.name === 'NetworkError') {
    errorHandler.handleNetworkError(error, context);
  } else {
    errorHandler.logError({
      code: 'UNKNOWN_ERROR',
      message: error?.message || 'An unexpected error occurred',
      details: error,
      timestamp: new Date(),
      context
    });
  }
};
