
import { AuthError } from '@supabase/supabase-js';
import { SecurityUtils } from './security';

export interface ErrorContext {
  action: string;
  userId?: string;
  metadata?: any;
}

export class ErrorHandler {
  static handleAuthError(error: AuthError | Error, context: ErrorContext): void {
    console.error(`Authentication error in ${context.action}:`, error);
    
    // Log security event for authentication failures
    SecurityUtils.logSecurityEvent(
      'auth_error',
      'authentication',
      context.userId,
      false,
      error.message,
      {
        action: context.action,
        errorType: error.name,
        ...context.metadata
      }
    );
  }

  static handleDatabaseError(error: any, context: ErrorContext): void {
    console.error(`Database error in ${context.action}:`, error);
    
    SecurityUtils.logSecurityEvent(
      'db_error',
      'database',
      context.userId,
      false,
      error.message,
      {
        action: context.action,
        ...context.metadata
      }
    );
  }

  static handleSecurityViolation(
    violation: string,
    context: ErrorContext & { severity: 'low' | 'medium' | 'high' | 'critical' }
  ): void {
    console.error(`Security violation in ${context.action}:`, violation);
    
    SecurityUtils.logSecurityEvent(
      'security_violation',
      'security',
      context.userId,
      false,
      violation,
      {
        action: context.action,
        severity: context.severity,
        ...context.metadata
      }
    );
  }

  static logError(error: any, context: ErrorContext): void {
    console.error(`General error in ${context.action}:`, error);
    
    SecurityUtils.logSecurityEvent(
      'general_error',
      'application',
      context.userId,
      false,
      error.message || String(error),
      {
        action: context.action,
        ...context.metadata
      }
    );
  }
}

export const errorHandler = new ErrorHandler();

export const handleApiError = (error: any, context: string) => {
  if (error.name === 'AuthError') {
    ErrorHandler.handleAuthError(error, { action: context });
  } else {
    ErrorHandler.handleDatabaseError(error, { action: context });
  }
};
