
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorInfo {
  message: string;
  context?: string;
  timestamp: Date;
}

export const useErrorBoundary = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const { toast } = useToast();

  const captureError = useCallback((error: Error | string, context?: string) => {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      context,
      timestamp: new Date()
    };

    console.error('🚨 Error captured:', errorInfo);
    
    setErrors(prev => [...prev.slice(-4), errorInfo]); // Keep last 5 errors
    
    toast({
      title: "Error",
      description: errorInfo.message,
      variant: "destructive",
    });
  }, [toast]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const withErrorBoundary = useCallback(<T extends any[], R>(
    fn: (...args: T) => R | Promise<R>,
    context?: string
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        const result = await fn(...args);
        return result;
      } catch (error) {
        captureError(error as Error, context);
        return undefined;
      }
    };
  }, [captureError]);

  return {
    errors,
    captureError,
    clearErrors,
    withErrorBoundary
  };
};
