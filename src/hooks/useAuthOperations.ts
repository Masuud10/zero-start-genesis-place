import { useState, useCallback, useRef, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { errorHandler, handleApiError } from '@/utils/errorHandler';
import { PerformanceMonitor } from '@/utils/performance';

export const useAuthOperations = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const signingOutRef = useRef(false);

  const fetchUserProfile = useMemo(() => {
    return async (authUser: User) => {
      if (!isMountedRef.current || fetchingRef.current) {
        console.log('👤 AuthOperations: Skipping fetch - unmounted or already fetching');
        return;
      }
      
      fetchingRef.current = true;
      const endTimer = PerformanceMonitor.startTimer('fetch_user_profile');
      
      try {
        console.log('👤 AuthOperations: Fetching user profile for', authUser.email, 'with metadata:', authUser.user_metadata);
        
        // Add timeout to profile fetch
        const profilePromise = supabase
          .from('profiles')
          .select('id, email, name, role, school_id, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
        );

        const { data: profile, error } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;

        if (!isMountedRef.current) {
          console.log('👤 AuthOperations: Component unmounted during fetch');
          return;
        }

        if (error) {
          console.error('👤 AuthOperations: Error fetching profile:', error);
          handleApiError(error, 'fetch_user_profile');
        }

        // Create user data with proper role handling
        let userRole = profile?.role;
        
        // If no role in profile, check user metadata
        if (!userRole) {
          userRole = authUser.user_metadata?.role || authUser.app_metadata?.role;
        }
        
        // If still no role, determine from email patterns
        if (!userRole) {
          if (authUser.email?.includes('@elimisha') || authUser.email === 'masuud@gmail.com') {
            userRole = 'elimisha_admin';
          } else if (authUser.email?.includes('admin')) {
            userRole = 'edufam_admin';
          } else if (authUser.email?.includes('principal')) {
            userRole = 'principal';
          } else if (authUser.email?.includes('teacher')) {
            userRole = 'teacher';
          } else if (authUser.email?.includes('owner')) {
            userRole = 'school_owner';
          } else if (authUser.email?.includes('finance')) {
            userRole = 'finance_officer';
          } else {
            userRole = 'parent'; // Default role
          }
        }

        const userData: AuthUser = {
          ...authUser,
          role: userRole,
          name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          school_id: profile?.school_id || authUser.user_metadata?.school_id || authUser.app_metadata?.school_id,
          avatar_url: profile?.avatar_url
        };

        console.log('👤 AuthOperations: Setting user data with role:', userData.role, 'user:', userData);
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ AuthOperations: Exception fetching user profile:', error);
        handleApiError(error, 'fetch_user_profile');
        
        if (!isMountedRef.current) return;
        
        // Create fallback user data with proper role determination
        let fallbackRole = authUser.user_metadata?.role || authUser.app_metadata?.role;
        
        if (!fallbackRole) {
          if (authUser.email?.includes('@elimisha') || authUser.email === 'masuud@gmail.com') {
            fallbackRole = 'elimisha_admin';
          } else if (authUser.email?.includes('admin')) {
            fallbackRole = 'edufam_admin';
          } else if (authUser.email?.includes('principal')) {
            fallbackRole = 'principal';
          } else if (authUser.email?.includes('teacher')) {
            fallbackRole = 'teacher';
          } else if (authUser.email?.includes('owner')) {
            fallbackRole = 'school_owner';
          } else if (authUser.email?.includes('finance')) {
            fallbackRole = 'finance_officer';
          } else {
            fallbackRole = 'parent';
          }
        }
        
        const userData: AuthUser = {
          ...authUser,
          role: fallbackRole,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          school_id: authUser.user_metadata?.school_id || authUser.app_metadata?.school_id
        };
        
        console.log('👤 AuthOperations: Using fallback user data with role:', userData.role);
        setUser(userData);
        setIsLoading(false);
      } finally {
        fetchingRef.current = false;
        endTimer();
      }
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isMountedRef.current) return { data: null, error: { message: 'Component unmounted' } };
    
    const endTimer = PerformanceMonitor.startTimer('auth_signin');
    console.log('🔑 AuthOperations: Attempting sign in for', email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      console.log('🔑 AuthOperations: Sign in result', { 
        success: !!data.user, 
        error: error?.message,
        user: data.user?.email 
      });
      
      if (error) {
        console.error('🔑 AuthOperations: Sign in error:', error);
        errorHandler.handleAuthError(error, 'signin');
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ AuthOperations: Sign in exception:', error);
      handleApiError(error, 'signin');
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return { data: null, error: { message: error.message || 'Authentication failed' } };
    } finally {
      endTimer();
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata = {}) => {
    if (!isMountedRef.current) return { data: null, error: { message: 'Component unmounted' } };
    
    const endTimer = PerformanceMonitor.startTimer('auth_signup');
    console.log('📝 AuthOperations: Attempting sign up for', email);
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
      
      console.log('📝 AuthOperations: Sign up result', { 
        success: !!data.user, 
        error: error?.message,
        needsConfirmation: !data.user?.email_confirmed_at
      });
      
      if (error) {
        errorHandler.handleAuthError(error, 'signup');
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        return { data: null, error };
      }
      
      if (data.user && !data.session) {
        console.log('📝 AuthOperations: Sign up successful, email confirmation required');
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ AuthOperations: Sign up exception:', error);
      handleApiError(error, 'signup');
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return { data: null, error: { message: error.message || 'Sign up failed' } };
    } finally {
      endTimer();
    }
  }, []);

  const signOut = useCallback(async () => {
    // Prevent multiple simultaneous logout attempts
    if (signingOutRef.current) {
      console.log('🚪 AuthOperations: Logout already in progress, skipping');
      return;
    }

    signingOutRef.current = true;
    const endTimer = PerformanceMonitor.startTimer('auth_signout');
    console.log('🚪 AuthOperations: Starting logout process');
    
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
        console.warn('⚠️ AuthOperations: Storage cleanup error (non-critical):', storageError);
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
            console.error('❌ AuthOperations: Sign out error:', error);
            errorHandler.handleAuthError(error, 'signout');
          } else {
            console.log('ℹ️ AuthOperations: Session was already expired/missing (handled gracefully)');
          }
        } else {
          console.log('✅ AuthOperations: Successfully signed out from Supabase');
        }
      } catch (supabaseError: any) {
        // Handle network errors or other exceptions gracefully
        console.warn('⚠️ AuthOperations: Supabase signout error (handled):', supabaseError.message);
      }
      
      console.log('✅ AuthOperations: Logout process completed');
      setIsLoading(false);
      
      // Force page reload for clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error: any) {
      console.error('❌ AuthOperations: Critical logout error:', error);
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
    console.log('🧹 AuthOperations: Cleaning up');
    isMountedRef.current = false;
    fetchingRef.current = false;
    signingOutRef.current = false;
  }, []);

  return {
    user,
    isLoading,
    setUser,
    setIsLoading,
    fetchUserProfile,
    signIn,
    signUp,
    signOut,
    cleanup
  };
};
