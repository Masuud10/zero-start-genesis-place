
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { tokenManager } from '@/utils/tokenManager';
import { auditLogger } from '@/utils/auditLogger';
import { CSRFTokenManager } from '@/utils/csrfTokenManager';

export const useAuthSignOut = () => {
  const [isLoading, setIsLoading] = useState(false);

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
      CSRFTokenManager.clearToken();
      
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

  return {
    secureSignOut,
    isLoading
  };
};
