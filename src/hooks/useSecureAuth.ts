
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from '@/utils/errorHandler';
import { ValidationUtils } from '@/utils/validation';
import { PerformanceMonitor } from '@/utils/performance';

export const useSecureAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    // Generate CSRF token on mount
    const token = ValidationUtils.generateCSRFToken();
    setCsrfToken(token);
  }, []);

  const secureSignIn = useCallback(async (email: string, password: string, token: string) => {
    const endTimer = PerformanceMonitor.startTimer('auth_signin');
    
    try {
      // Validate CSRF token
      if (!ValidationUtils.validateCSRFToken(token)) {
        throw new Error('Invalid security token. Please refresh the page.');
      }

      // Rate limiting
      if (!ValidationUtils.checkRateLimit(`signin_${email}`, 5, 15 * 60 * 1000)) {
        throw new Error('Too many login attempts. Please wait 15 minutes before trying again.');
      }

      // Validate inputs
      if (!ValidationUtils.isValidEmail(email)) {
        throw new Error('Please enter a valid email address.');
      }

      const sanitizedEmail = ValidationUtils.sanitizeText(email);
      
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        errorHandler.handleAuthError(error, 'secure_signin');
        throw error;
      }

      // Clear rate limit on successful login
      localStorage.removeItem(`rate_limit_signin_${email}`);

      return { data, error: null };
    } catch (error: any) {
      errorHandler.handleAuthError(error, 'secure_signin');
      return { data: null, error };
    } finally {
      setIsLoading(false);
      endTimer();
    }
  }, []);

  const secureSignUp = useCallback(async (email: string, password: string, name: string, token: string) => {
    const endTimer = PerformanceMonitor.startTimer('auth_signup');
    
    try {
      // Validate CSRF token
      if (!ValidationUtils.validateCSRFToken(token)) {
        throw new Error('Invalid security token. Please refresh the page.');
      }

      // Rate limiting
      if (!ValidationUtils.checkRateLimit(`signup_${email}`, 3, 60 * 60 * 1000)) {
        throw new Error('Too many signup attempts. Please wait 1 hour before trying again.');
      }

      // Validate inputs
      if (!ValidationUtils.isValidEmail(email)) {
        throw new Error('Please enter a valid email address.');
      }

      const passwordValidation = ValidationUtils.isStrongPassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '));
      }

      const sanitizedEmail = ValidationUtils.sanitizeText(email);
      const sanitizedName = ValidationUtils.sanitizeText(name);
      
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: {
            name: sanitizedName
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        errorHandler.handleAuthError(error, 'secure_signup');
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      errorHandler.handleAuthError(error, 'secure_signup');
      return { data: null, error };
    } finally {
      setIsLoading(false);
      endTimer();
    }
  }, []);

  const secureSignOut = useCallback(async () => {
    const endTimer = PerformanceMonitor.startTimer('auth_signout');
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        errorHandler.handleAuthError(error, 'secure_signout');
      }

      // Clear all stored tokens and cache
      sessionStorage.clear();
      localStorage.removeItem('csrf_token');
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error: any) {
      errorHandler.handleAuthError(error, 'secure_signout');
    } finally {
      setIsLoading(false);
      endTimer();
    }
  }, []);

  return {
    secureSignIn,
    secureSignUp,
    secureSignOut,
    isLoading,
    csrfToken
  };
};
