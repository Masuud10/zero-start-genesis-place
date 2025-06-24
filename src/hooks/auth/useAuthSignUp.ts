
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { rateLimiter } from '@/utils/rateLimiter';
import { auditLogger } from '@/utils/auditLogger';
import { CSRFTokenManager } from '@/utils/csrfTokenManager';
import { validatePasswordStrength, validateEmail, sanitizeEmail, sanitizeName } from '@/utils/securityValidation';

export const useAuthSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);

  const secureSignUp = useCallback(async (email: string, password: string, name: string, token: string) => {
    try {
      // Validate CSRF token
      if (!CSRFTokenManager.validateToken(token)) {
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
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address.');
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '));
      }

      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedName = sanitizeName(name);
      
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

  return {
    secureSignUp,
    isLoading
  };
};
