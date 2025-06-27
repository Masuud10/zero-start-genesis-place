
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoginCredentials, SignupCredentials } from '@/types/auth';
import { cleanupAuthState } from '@/utils/authCleanup';

export const useAuthActions = () => {
  const signIn = useCallback(async (credentials: LoginCredentials) => {
    console.log('🔑 AuthActions: Attempting sign in for', credentials.email);
    try {
      // Clean up any existing session first for safety
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (cleanupError) {
        console.warn('🔑 AuthActions: Cleanup warning:', cleanupError);
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });
      if (error) {
        console.error('🔑 AuthActions: Sign in error:', error);
        return { error: error.message };
      }
      if (data.user) {
        console.log('🔑 AuthActions: Sign in successful for', credentials.email);
        return { error: undefined };
      }
      return { error: 'Sign in failed - no user returned' };
    } catch (error: any) {
      console.error('❌ AuthActions: Sign in exception:', error);
      return { error: error.message || 'Authentication failed' };
    }
  }, []);

  const signUp = useCallback(async (credentials: SignupCredentials) => {
    console.log('📝 AuthActions: Attempting sign up for', credentials.email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.trim(),
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            role: credentials.role || 'parent',
            school_id: credentials.school_id
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      if (error) {
        console.error('📝 AuthActions: Sign up error:', error);
        return { error: error.message };
      }
      console.log('📝 AuthActions: Sign up successful for', credentials.email);
      return { error: undefined };
    } catch (error: any) {
      console.error('❌ AuthActions: Sign up exception:', error);
      return { error: error.message || 'Sign up failed' };
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

      // Force redirect to login page instead of landing page
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);

    } catch (error: any) {
      console.error('❌ AuthActions: Logout error:', error);
      // Fallback hard reload to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }, []);

  return {
    signIn,
    signUp,
    signOut
  };
};
