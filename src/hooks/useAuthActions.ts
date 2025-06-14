
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthActions = () => {
  // Ensure all hooks are called unconditionally and in the same order
  const signIn = useCallback(async (email: string, password: string) => {
    console.log('🔑 AuthActions: Attempting sign in for', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('🔑 AuthActions: Sign in error:', error);
        return { data: null, error };
      }
      
      console.log('🔑 AuthActions: Sign in successful for', email);
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ AuthActions: Sign in exception:', error);
      return { data: null, error: { message: error.message || 'Authentication failed' } };
    }
  }, []); // Empty dependency array to prevent recreation

  const signUp = useCallback(async (email: string, password: string, metadata = {}) => {
    console.log('📝 AuthActions: Attempting sign up for', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: email.split('@')[0],
            ...metadata
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('📝 AuthActions: Sign up error:', error);
        return { data: null, error };
      }
      
      console.log('📝 AuthActions: Sign up successful for', email);
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ AuthActions: Sign up exception:', error);
      return { data: null, error: { message: error.message || 'Sign up failed' } };
    }
  }, []); // Empty dependency array to prevent recreation

  const signOut = useCallback(async () => {
    console.log('🚪 AuthActions: Starting logout process');
    
    try {
      // Clear local storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error && !error.message.includes('Auth session missing')) {
        console.error('❌ AuthActions: Sign out error:', error);
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
  }, []); // Empty dependency array to prevent recreation

  // Always return the same object structure
  return {
    signIn,
    signUp,
    signOut
  };
};
