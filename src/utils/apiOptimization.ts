import { toast } from '../hooks/use-toast';

export class APIOptimizationUtils {
  private static requestQueues: Map<string, Promise<unknown>> = new Map();
  private static cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();

  /**
   * Deduplicates identical API requests by returning the same promise
   * if a request with the same key is already in progress
   */
  static deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestQueues.has(key)) {
      console.log('🔄 API: Deduplicating request for', key);
      return this.requestQueues.get(key)! as Promise<T>;
    }

    const promise = requestFn().finally(() => {
      this.requestQueues.delete(key);
    });

    this.requestQueues.set(key, promise);
    return promise as Promise<T>;
  }

  /**
   * Caches API responses with TTL support
   */
  static getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    console.log('📦 API: Using cached data for', key);
    return cached.data as T;
  }

  /**
   * Sets cached data with TTL
   */
  static setCachedData<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
    console.log('💾 API: Cached data for', key, 'TTL:', ttlMs + 'ms');
  }

  /**
   * Clears specific cache entries or all cache
   */
  static clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      console.log('🧹 API: Cleared all cache');
      return;
    }

    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log('🧹 API: Cleared cache for pattern', pattern, 'Keys:', keysToDelete.length);
  }

  /**
   * Batches multiple API calls and executes them in parallel
   */
  static async batchRequests<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    console.log('📦 API: Batching', requests.length, 'requests');
    return Promise.all(requests.map(req => req()));
  }

  /**
   * Delays execution to avoid overwhelming the API
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets cache statistics for debugging
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * API Error Handler with user feedback
 */
export class ApiErrorHandler {
  static handle(error: unknown, context: string = 'API call'): void {
    console.error(`❌ ${context} error:`, error);
    
    let message = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String(error.message);
    }
    
    // Provide user-friendly error messages
    const userMessage = this.getUserFriendlyMessage(message, context);
    
    toast({
      title: `${context} Failed`,
      description: userMessage,
      variant: 'destructive',
    });
  }
  
  private static getUserFriendlyMessage(errorMessage: string, context: string): string {
    const lowerMessage = errorMessage.toLowerCase();
    
    // Authentication errors
    if (lowerMessage.includes('authentication') || lowerMessage.includes('unauthorized')) {
      return 'Please log in again to continue.';
    }
    
    // Permission errors
    if (lowerMessage.includes('permission') || lowerMessage.includes('access denied')) {
      return 'You do not have permission to perform this action.';
    }
    
    // Network errors
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    
    // Timeout errors
    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return 'Request timed out. Please try again.';
    }
    
    // Database errors
    if (lowerMessage.includes('database') || lowerMessage.includes('sql')) {
      return 'Database error occurred. Please try again later.';
    }
    
    // Validation errors
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
      return errorMessage;
    }
    
    // Default fallback
    return errorMessage || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * UUID Validation Utility
 */
export class UuidValidator {
  static isValid(uuid: string | null | undefined): boolean {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
  
  static validateAndThrow(uuid: string | null | undefined, context: string = 'UUID'): void {
    if (!this.isValid(uuid)) {
      throw new Error(`Invalid ${context}: ${uuid}`);
    }
  }
}

/**
 * Retry Logic for API Calls
 */
export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    context: string = 'API call'
  ): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          throw error;
        }
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`🔄 ${context}: Retry attempt ${attempt + 1}/${maxRetries + 1} in ${delay}ms`);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }
  
  private static shouldNotRetry(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Don't retry authentication, permission, or validation errors
      return message.includes('authentication') ||
             message.includes('unauthorized') ||
             message.includes('permission') ||
             message.includes('access denied') ||
             message.includes('validation') ||
             message.includes('invalid');
    }
    
    return false;
  }
  
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Query Error Handler for React Query
 */
export const queryErrorHandler = (error: unknown, context: string = 'Query'): void => {
  console.error(`❌ ${context} error:`, error);
  
  // Don't show toast for certain errors that are handled elsewhere
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('authentication') || message.includes('permission')) {
      return; // These are handled by auth context
    }
  }
  
  ApiErrorHandler.handle(error, context);
};

/**
 * Mutation Error Handler for React Query
 */
export const mutationErrorHandler = (error: unknown, context: string = 'Mutation'): void => {
  console.error(`❌ ${context} error:`, error);
  ApiErrorHandler.handle(error, context);
};

/**
 * Timeout Handler for API Calls
 */
export class TimeoutHandler {
  static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = 30000,
    context: string = 'API call'
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${context} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }
}

/**
 * API Call Wrapper with comprehensive error handling
 */
export class ApiCallWrapper {
  static async execute<T>(
    operation: () => Promise<T>,
    options: {
      context?: string;
      maxRetries?: number;
      timeoutMs?: number;
      showErrorToast?: boolean;
    } = {}
  ): Promise<T> {
    const {
      context = 'API call',
      maxRetries = 2,
      timeoutMs = 30000,
      showErrorToast = true
    } = options;
    
    try {
      const result = await RetryHandler.withRetry(
        () => TimeoutHandler.withTimeout(operation(), timeoutMs, context),
        maxRetries,
        1000,
        context
      );
      
      return result;
    } catch (error) {
      if (showErrorToast) {
        ApiErrorHandler.handle(error, context);
      }
      throw error;
    }
  }
}

/**
 * Database Query Optimizer
 */
export class QueryOptimizer {
  static validateQueryParams(params: Record<string, unknown>): void {
    // Validate UUIDs
    for (const [key, value] of Object.entries(params)) {
      if (key.toLowerCase().includes('id') && typeof value === 'string') {
        UuidValidator.validateAndThrow(value, key);
      }
    }
  }
  
  static logSlowQuery(queryName: string, startTime: number): void {
    const duration = Date.now() - startTime;
    if (duration > 1000) { // Log queries taking more than 1 second
      console.warn(`🐌 Slow query detected: ${queryName} took ${duration}ms`);
    }
  }
}

/**
 * Form Validation Helper
 */
export class FormValidator {
  static validateRequired(value: unknown, fieldName: string): string | null {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  }
  
  static validateEmail(email: string): string | null {
    if (!email) return null; // Optional field
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  }
  
  static validatePhone(phone: string): string | null {
    if (!phone) return null; // Optional field
    
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  }
  
  static validateUrl(url: string): string | null {
    if (!url) return null; // Optional field
    
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }
}
