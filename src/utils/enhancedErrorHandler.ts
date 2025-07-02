import { supabase } from '@/integrations/supabase/client';

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

export class EnhancedErrorHandler {
  private static circuitBreakers = new Map<string, CircuitBreakerState>();
  private static readonly FAILURE_THRESHOLD = 5;
  private static readonly TIMEOUT_DURATION = 60000; // 1 minute
  private static readonly RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

  static async handleWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // Check circuit breaker
      if (this.isCircuitOpen(operationName)) {
        throw new Error(`Circuit breaker open for ${operationName}. Service temporarily unavailable.`);
      }
      
      try {
        const result = await operation();
        this.recordSuccess(operationName);
        return result;
      } catch (error: any) {
        lastError = error;
        this.recordFailure(operationName);
        
        console.warn(`❌ Attempt ${attempt + 1} failed for ${operationName}:`, error?.message);
        
        // Don't retry certain errors
        if (this.shouldNotRetry(error)) {
          break;
        }
        
        // Don't wait after the last attempt
        if (attempt < maxRetries) {
          await this.delay(this.RETRY_DELAYS[attempt] || 4000);
        }
      }
    }
    
    // Log persistent failure
    this.logPersistentFailure(operationName, lastError, maxRetries + 1);
    throw lastError;
  }

  private static shouldNotRetry(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    
    // Don't retry auth errors, permission errors, or validation errors
    return (
      message.includes('auth') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('invalid') ||
      message.includes('permission') ||
      message.includes('validation') ||
      error?.status === 401 ||
      error?.status === 403 ||
      error?.status === 422
    );
  }

  private static isCircuitOpen(operationName: string): boolean {
    const state = this.circuitBreakers.get(operationName);
    if (!state) return false;
    
    const now = Date.now();
    
    switch (state.state) {
      case 'open':
        if (now - state.lastFailure > this.TIMEOUT_DURATION) {
          state.state = 'half-open';
          return false;
        }
        return true;
      case 'half-open':
        return false;
      default:
        return false;
    }
  }

  private static recordSuccess(operationName: string): void {
    const state = this.circuitBreakers.get(operationName);
    if (state) {
      state.failures = 0;
      state.state = 'closed';
    }
  }

  private static recordFailure(operationName: string): void {
    const state = this.circuitBreakers.get(operationName) || {
      failures: 0,
      lastFailure: 0,
      state: 'closed' as const
    };
    
    state.failures++;
    state.lastFailure = Date.now();
    
    if (state.failures >= this.FAILURE_THRESHOLD) {
      state.state = 'open';
      console.error(`🚨 Circuit breaker opened for ${operationName} after ${state.failures} failures`);
    }
    
    this.circuitBreakers.set(operationName, state);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static async logPersistentFailure(
    operationName: string,
    error: any,
    attempts: number
  ): Promise<void> {
    try {
      // Don't block on logging
      setTimeout(async () => {
        const { error: logError } = await supabase
          .from('security_audit_logs')
          .insert({
            action: 'persistent_failure',
            resource: 'application',
            success: false,
            error_message: error?.message || 'Unknown error',
            metadata: {
              operation_name: operationName,
              attempts,
              error_type: error?.name,
              timestamp: new Date().toISOString()
            }
          });
        
        if (logError) {
          console.warn('Failed to log persistent failure:', logError);
        }
      }, 0);
    } catch (err) {
      console.warn('Failed to log persistent failure:', err);
    }
  }

  // Specific handlers for common operations
  static async handleDatabaseOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return this.handleWithRetry(operation, `db_${operationName}`, 2);
  }

  static async handleAuthOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    // Auth operations shouldn't be retried as aggressively
    return this.handleWithRetry(operation, `auth_${operationName}`, 1);
  }

  static async handleAPIOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return this.handleWithRetry(operation, `api_${operationName}`, 3);
  }

  // Get circuit breaker status for monitoring
  static getCircuitBreakerStatus(): Array<{ name: string; state: CircuitBreakerState }> {
    return Array.from(this.circuitBreakers.entries()).map(([name, state]) => ({
      name,
      state
    }));
  }

  // Reset circuit breaker (for admin use)
  static resetCircuitBreaker(operationName: string): void {
    this.circuitBreakers.delete(operationName);
    console.log(`🔄 Circuit breaker reset for ${operationName}`);
  }
}

// Export convenience functions
export const withDatabaseRetry = EnhancedErrorHandler.handleDatabaseOperation.bind(EnhancedErrorHandler);
export const withAuthRetry = EnhancedErrorHandler.handleAuthOperation.bind(EnhancedErrorHandler);
export const withAPIRetry = EnhancedErrorHandler.handleAPIOperation.bind(EnhancedErrorHandler);