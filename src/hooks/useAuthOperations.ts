
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

  const fetchUserProfile = useMemo(() => {
    return async (authUser: User) => {
      if (!isMountedRef.current || fetchingRef.current) {
        console.log('👤 AuthOperations: Skipping fetch - unmounted or already fetching');
        return;
      }
      
      fetchingRef.current = true;
      const endTimer = PerformanceMonitor.startTimer('fetch_user_profile');
      
      try {
        console.log('👤 AuthOperations: Fetching user profile for', authUser.email);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, email, name, role, school_id, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle();

        if (!isMountedRef.current) {
          console.log('👤 AuthOperations: Component unmounted during fetch');
          return;
        }

        if (error) {
          console.error('👤 AuthOperations: Error fetching profile:', error);
          handleApiError(error, 'fetch_user_profile');
        }

        const userData: AuthUser = {
          ...authUser,
          role: profile?.role || 'parent',
          name: profile?.name || authUser.email?.split('@')[0] || 'User',
          school_id: profile?.school_id,
          avatar_url: profile?.avatar_url
        };

        console.log('👤 AuthOperations: Setting user data:', userData);
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ AuthOperations: Exception fetching user profile:', error);
        handleApiError(error, 'fetch_user_profile');
        
        if (!isMountedRef.current) return;
        
        // Create fallback user data
        const userData: AuthUser = {
          ...authUser,
          role: 'parent',
          name: authUser.email?.split('@')[0] || 'User'
        };
        
        console.log('👤 AuthOperations: Using fallback user data after exception');
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
    const endTimer = PerformanceMonitor.startTimer('auth_signout');
    console.log('🚪 AuthOperations: Signing out');
    setIsLoading(true);
    
    try {
      setUser(null);
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error && !error.message.includes('Auth session missing')) {
        console.error('❌ AuthOperations: Sign out error:', error);
        errorHandler.handleAuthError(error, 'signout');
      }
      
      console.log('✅ AuthOperations: Successfully signed out');
      setIsLoading(false);
      
      // Clear session storage and force reload
      sessionStorage.clear();
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ AuthOperations: Sign out exception:', error);
      handleApiError(error, 'signout');
      setUser(null);
      setIsLoading(false);
    } finally {
      endTimer();
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log('🧹 AuthOperations: Cleaning up');
    isMountedRef.current = false;
    fetchingRef.current = false;
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
