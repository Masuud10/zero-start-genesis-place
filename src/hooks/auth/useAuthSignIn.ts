
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { rateLimiter, RateLimiter } from '@/utils/rateLimiter';
import { auditLogger } from '@/utils/auditLogger';
import { tokenManager } from '@/utils/tokenManager';
import { CSRFTokenManager } from '@/utils/csrfTokenManager';
import { validateEmail, sanitizeEmail } from '@/utils/securityValidation';

export const useAuthSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const secureSignIn = useCallback(async (email: string, password: string, token: string) => {
    try {
      // Validate CSRF token
      if (!CSRFTokenManager.validateToken(token)) {
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
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address.');
      }

      const sanitizedEmail = sanitizeEmail(email);
      
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

  return {
    secureSignIn,
    isLoading
  };
};
