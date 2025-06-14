
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ErrorHandler, handleApiError } from '@/utils/errorHandler';
import { PerformanceMonitor } from '@/utils/performance';

export const useAuthActions = () => {
  const isMountedRef = useRef(true);
  const signingOutRef = useRef(false);

  const signIn = useCallback(async (email: string, password: string, setIsLoading: (loading: boolean) => void) => {
    if (!isMountedRef.current) return { data: null, error: { message: 'Component unmounted' } };
    
    const endTimer = PerformanceMonitor.startTimer('auth_signin');
    console.log('🔑 AuthActions: Attempting sign in for', email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      console.log('🔑 AuthActions: Sign in result', { 
        success: !!data.user, 
        error: error?.message,
        user: data.user?.email 
      });
      
      if (error) {
        console.error('🔑 AuthActions: Sign in error:', error);
        ErrorHandler.handleAuthError(error, { action: 'signin' });
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ AuthActions: Sign in exception:', error);
      handleApiError(error, 'signin');
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return { data: null, error: { message: error.message || 'Authentication failed' } };
    } finally {
      endTimer();
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata = {}, setIsLoading: (loading: boolean) => void) => {
    if (!isMountedRef.current) return { data: null, error: { message: 'Component unmounted' } };
    
    const endTimer = PerformanceMonitor.startTimer('auth_signup');
    console.log('📝 AuthActions: Attempting sign up for', email);
    setIsLoading(true);
    
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
      
      console.log('📝 AuthActions: Sign up result', { 
        success: !!data.user, 
        error: error?.message,
        needsConfirmation: !data.user?.email_confirmed_at
      });
      
      if (error) {
        ErrorHandler.handleAuthError(error, { action: 'signup' });
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        return { data: null, error };
      }
      
      if (data.user && !data.session) {
        console.log('📝 AuthActions: Sign up successful, email confirmation required');
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ AuthActions: Sign up exception:', error);
      handleApiError(error, 'signup');
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return { data: null, error: { message: error.message || 'Sign up failed' } };
    } finally {
      endTimer();
    }
  }, []);

  const signOut = useCallback(async (setUser: (user: any) => void, setIsLoading: (loading: boolean) => void) => {
    // Prevent multiple simultaneous logout attempts
    if (signingOutRef.current) {
      console.log('🚪 AuthActions: Logout already in progress, skipping');
      return;
    }

    signingOutRef.current = true;
    const endTimer = PerformanceMonitor.startTimer('auth_signout');
    console.log('🚪 AuthActions: Starting logout process');
    
    try {
      // Clear user state immediately to prevent UI confusion
      setUser(null);
      setIsLoading(true);
      
      // Clear local storage first
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('⚠️ AuthActions: Storage cleanup error (non-critical):', storageError);
      }
      
      // Attempt to sign out from Supabase
      try {
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        
        if (error) {
          // Only log errors that aren't about missing sessions
          if (!error.message.includes('Auth session missing') && 
              !error.message.includes('Session not found') &&
              !error.message.includes('session id') && 
              !error.message.includes("doesn't exist")) {
            console.error('❌ AuthActions: Sign out error:', error);
            ErrorHandler.handleAuthError(error, { action: 'signout' });
          } else {
            console.log('ℹ️ AuthActions: Session was already expired/missing (handled gracefully)');
          }
        } else {
          console.log('✅ AuthActions: Successfully signed out from Supabase');
        }
      } catch (supabaseError: any) {
        // Handle network errors or other exceptions gracefully
        console.warn('⚠️ AuthActions: Supabase signout error (handled):', supabaseError.message);
      }
      
      console.log('✅ AuthActions: Logout process completed');
      setIsLoading(false);
      
      // Force page reload for clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error: any) {
      console.error('❌ AuthActions: Critical logout error:', error);
      // Even if logout fails, clear state and redirect
      setUser(null);
      setIsLoading(false);
      
      // Force page reload as fallback
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } finally {
      signingOutRef.current = false;
      endTimer();
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log('🧹 AuthActions: Cleaning up');
    isMountedRef.current = false;
    signingOutRef.current = false;
  }, []);

  return {
    signIn,
    signUp,
    signOut,
    cleanup
  };
};
