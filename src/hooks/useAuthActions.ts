
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoginCredentials, SignupCredentials } from '@/types/auth';

export const useAuthActions = () => {
  const signIn = useCallback(async (credentials: LoginCredentials) => {
    console.log('🔑 AuthActions: Attempting sign in for', credentials.email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });
      
      if (error) {
        console.error('🔑 AuthActions: Sign in error:', error);
        return { error: error.message };
      }
      
      console.log('🔑 AuthActions: Sign in successful for', credentials.email);
      return { error: undefined };
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
            role: credentials.role,
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
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error && !error.message.includes('Auth session missing')) {
        console.error('❌ AuthActions: Sign out error:', error);
      }
      
      // Clear local storage
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Failed to clear localStorage:', e);
      }
      
      console.log('✅ AuthActions: Logout completed');
      
      // Force page reload for clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error: any) {
      console.error('❌ AuthActions: Logout error:', error);
      // Force page reload as fallback
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  }, []);

  return {
    signIn,
    signUp,
    signOut
  };
};
