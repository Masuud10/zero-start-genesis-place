
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { tokenManager } from '@/utils/tokenManager';
import { rateLimiter, RateLimiter } from '@/utils/rateLimiter';
import { auditLogger } from '@/utils/auditLogger';
import { EncryptionUtils } from '@/utils/encryption';

export const useSecureAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  useEffect(() => {
    // Generate CSRF token on mount
    const token = crypto.randomUUID();
    setCsrfToken(token);
    sessionStorage.setItem('csrf_token', token);
  }, []);

  const secureSignIn = useCallback(async (email: string, password: string, token: string) => {
    try {
      // Validate CSRF token
      const storedToken = sessionStorage.getItem('csrf_token');
      if (!token || token !== storedToken) {
        throw new Error('Invalid security token. Please refresh the page.');
      }

      // Check rate limiting
      const rateLimit = rateLimiter.checkLimit({
        ...RateLimiter.LOGIN_LIMIT,
        identifier: `login_${email}`
      });

      if (!rateLimit.allowed) {
        const resetMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
        throw new Error(`Too many login attempts. Please wait ${resetMinutes} minutes before trying again.`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }

      const sanitizedEmail = email.trim().toLowerCase();
      
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        // Log failed login attempt
        await auditLogger.logLogin(sanitizedEmail, false, error.message);
        throw error;
      }

      if (data.user) {
        // Log successful login
        await auditLogger.logLogin(data.user.id, true);
        
        // Store tokens securely
        if (data.session) {
          await tokenManager.rotateTokens();
        }
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Secure sign in error:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const secureSignUp = useCallback(async (email: string, password: string, name: string, token: string) => {
    try {
      // Validate CSRF token
      const storedToken = sessionStorage.getItem('csrf_token');
      if (!token || token !== storedToken) {
        throw new Error('Invalid security token. Please refresh the page.');
      }

      // Check rate limiting
      const rateLimit = rateLimiter.checkLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3,
        identifier: `signup_${email}`
      });

      if (!rateLimit.allowed) {
        throw new Error('Too many signup attempts. Please wait 1 hour before trying again.');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '));
      }

      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedName = name.trim();
      
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
        await auditLogger.log({
          action: 'SIGNUP_FAILED',
          resource: 'authentication',
          success: false,
          error_message: error.message,
          metadata: { email: sanitizedEmail }
        });
        throw error;
      }

      if (data.user) {
        await auditLogger.log({
          user_id: data.user.id,
          action: 'SIGNUP_SUCCESS',
          resource: 'authentication',
          success: true,
          metadata: { email: sanitizedEmail }
        });
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Secure sign up error:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const secureSignOut = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get current user for audit logging
      const { data: { user } } = await supabase.auth.getUser();
      
      // Blacklist current tokens
      const currentToken = tokenManager.getAccessToken();
      if (currentToken) {
        tokenManager.blacklistToken(currentToken);
      }
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Sign out error:', error);
      }

      // Log logout
      if (user) {
        await auditLogger.log({
          user_id: user.id,
          action: 'LOGOUT',
          resource: 'authentication',
          success: !error,
          error_message: error?.message
        });
      }

      // Clear all stored tokens and cache
      tokenManager.clearTokens();
      sessionStorage.clear();
      localStorage.removeItem('csrf_token');
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error: any) {
      console.error('Secure sign out error:', error);
      // Force reload anyway
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  }, []);

  private validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  return {
    secureSignIn,
    secureSignUp,
    secureSignOut,
    isLoading,
    csrfToken,
    captchaVerified,
    setCaptchaVerified
  };
};
