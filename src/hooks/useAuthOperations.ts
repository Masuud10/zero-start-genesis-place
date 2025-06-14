
import { useState, useCallback, useRef, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { ErrorHandler, handleApiError } from '@/utils/errorHandler';
import { PerformanceMonitor } from '@/utils/performance';

// Helper function to determine user role with improved logic
const determineUserRole = (authUser: User, profileRole?: string): string => {
  console.log('👤 Determining role for user:', authUser.email, 'profile role:', profileRole, 'metadata:', authUser.user_metadata, 'app_metadata:', authUser.app_metadata);

  // Priority 1: Use role from profile if available and valid
  if (profileRole && profileRole !== 'parent') {
    console.log('👤 Using profile role:', profileRole);
    return profileRole;
  }

  // Priority 2: Use role from user_metadata if available
  const metadataRole = authUser.user_metadata?.role;
  if (metadataRole && metadataRole !== 'parent') {
    console.log('👤 Using user_metadata role:', metadataRole);
    return metadataRole;
  }

  // Priority 3: Use role from app_metadata if available
  const appMetadataRole = authUser.app_metadata?.role;
  if (appMetadataRole && appMetadataRole !== 'parent') {
    console.log('👤 Using app_metadata role:', appMetadataRole);
    return appMetadataRole;
  }

  // Priority 4: Determine from email patterns (only if no other role found)
  const email = authUser.email?.toLowerCase() || '';
  
  if (email.includes('@elimisha') || email === 'masuud@gmail.com') {
    console.log('👤 Assigning elimisha_admin role based on email pattern');
    return 'elimisha_admin';
  }
  
  if (email.includes('admin') && !email.includes('parent')) {
    console.log('👤 Assigning edufam_admin role based on email pattern');
    return 'edufam_admin';
  }
  
  if (email.includes('principal') && !email.includes('parent')) {
    console.log('👤 Assigning principal role based on email pattern');
    return 'principal';
  }
  
  if (email.includes('teacher') && !email.includes('parent')) {
    console.log('👤 Assigning teacher role based on email pattern');
    return 'teacher';
  }
  
  if (email.includes('owner') && !email.includes('parent')) {
    console.log('👤 Assigning school_owner role based on email pattern');
    return 'school_owner';
  }
  
  if (email.includes('finance') && !email.includes('parent')) {
    console.log('👤 Assigning finance_officer role based on email pattern');
    return 'finance_officer';
  }

  // Default to parent only if no other role could be determined
  console.log('👤 Defaulting to parent role for:', email);
  return 'parent';
};

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
        console.log('👤 AuthOperations: Fetching user profile for', authUser.email);
        
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

        // Use improved role determination logic
        const finalRole = determineUserRole(authUser, profile?.role);

        const userData: AuthUser = {
          ...authUser,
          role: finalRole,
          name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          school_id: profile?.school_id || authUser.user_metadata?.school_id || authUser.app_metadata?.school_id,
          avatar_url: profile?.avatar_url
        };

        console.log('👤 AuthOperations: Final user data with role:', userData.role, 'for user:', userData.email, 'school_id:', userData.school_id);
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ AuthOperations: Exception fetching user profile:', error);
        handleApiError(error, 'fetch_user_profile');
        
        if (!isMountedRef.current) return;
        
        // Create fallback user data with improved role determination
        const fallbackRole = determineUserRole(authUser);
        
        const userData: AuthUser = {
          ...authUser,
          role: fallbackRole,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          school_id: authUser.user_metadata?.school_id || authUser.app_metadata?.school_id
        };
        
        console.log('👤 AuthOperations: Using fallback user data with role:', userData.role, 'for user:', userData.email, 'school_id:', userData.school_id);
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
        ErrorHandler.handleAuthError(error, { action: 'signin' });
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
        ErrorHandler.handleAuthError(error, { action: 'signup' });
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
            ErrorHandler.handleAuthError(error, { action: 'signout' });
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
