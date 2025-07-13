import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthService } from '@/services/authService';
import { LoginCredentials } from '@/types/auth';
import { cleanupAuthState } from '@/utils/authCleanup';

export const useAuthActions = () => {
  const navigate = useNavigate();
  
  const signIn = useCallback(async (credentials: LoginCredentials) => {
    console.log('🔑 AuthActions: Attempting sign in for', credentials.email, {
      strictValidation: credentials.strictValidation,
      accessType: credentials.accessType
    });
    
    try {
      // Clean up any existing session first for safety
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (cleanupError) {
        console.warn('🔑 AuthActions: Cleanup warning:', cleanupError);
      }

      // Use universal authentication if no access type is specified
      if (!credentials.accessType) {
        const result = await AuthService.authenticateUserUniversal(
          credentials.email, 
          credentials.password
        );
        
        if (!result.success) {
          console.error('🔑 AuthActions: Universal authentication failed:', result.error);
          return { error: result.error };
        }

        console.log('🔑 AuthActions: Universal authentication successful for', credentials.email);
        return { error: undefined };
      }

      // Use strict role validation if access type is specified
      if (credentials.strictValidation && credentials.accessType) {
        const result = await AuthService.authenticateUserWithStrictRoleValidation(
          credentials.email, 
          credentials.password, 
          credentials.accessType
        );
        
        if (!result.success) {
          console.error('🔑 AuthActions: Strict validation sign in failed:', result.error);
          return { error: result.error };
        }

        console.log('🔑 AuthActions: Strict validation sign in successful for', credentials.email);
        return { error: undefined };
      } else {
        // Use legacy authentication for backward compatibility
        const result = await AuthService.authenticateUser(credentials.email, credentials.password);
        
        if (!result.success) {
          console.error('🔑 AuthActions: Legacy sign in failed:', result.error);
          return { error: result.error };
        }

        console.log('🔑 AuthActions: Legacy sign in successful for', credentials.email);
        return { error: undefined };
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('❌ AuthActions: Sign in exception:', error);
      return { error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('🚪 AuthActions: Starting logout process');
    try {
      // Fully clean up local/session storage keys
      cleanupAuthState();

      // Sign out from Supabase globally
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        console.warn('❌ AuthActions: Error during global signout, proceeding anyway:', error);
      }
      console.log('✅ AuthActions: Logout completed');

      // Immediately navigate to login page using React Router
      navigate('/login', { replace: true });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      console.error('❌ AuthActions: Logout error:', error);
      // Fallback to login page
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return {
    signIn,
    signOut
  };
};
