
import { useState, useEffect, useRef, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);
  const initializedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    console.log('🔐 AuthState: Fetching profile for', userId);
    try {
      const profileTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      );

      const profilePromise = supabase
        .from('profiles')
        .select('role, name, school_id, avatar_url, mfa_enabled, status')
        .eq('id', userId)
        .maybeSingle();

      const { data, error } = await Promise.race([
        profilePromise,
        profileTimeout
      ]) as any;
      
      if (error) {
        console.error('🔐 AuthState: Profile fetch error:', error);
        return null;
      }

      return data;
    } catch (err: any) {
      console.error('🔐 AuthState: Profile fetch exception:', err);
      return null;
    }
  }, []);

  const processUser = useCallback(async (authUser: SupabaseUser | null) => {
    if (!isMountedRef.current) return;
    
    console.log('🔐 AuthState: Processing user', authUser?.email);
    
    try {
      if (!authUser) {
        console.log('🔐 AuthState: No auth user, clearing state');
        if (isMountedRef.current) {
          setUser(null);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      if (!authUser.email) {
        console.error('🔐 AuthState: User missing email');
        if (isMountedRef.current) {
          setError('User account is missing email address');
          setIsLoading(false);
        }
        return;
      }

      // Fetch profile with timeout
      const profile = await fetchProfile(authUser.id);

      if (!isMountedRef.current) return;

      // Create user data with fallback values
      const resolvedRole = profile?.role || 
                         authUser.user_metadata?.role || 
                         authUser.app_metadata?.role || 
                         'parent';

      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email,
        role: resolvedRole,
        name: profile?.name ||
              authUser.user_metadata?.name ||
              authUser.user_metadata?.full_name ||
              authUser.email.split('@')[0] ||
              'User',
        school_id: profile?.school_id ||
          authUser.user_metadata?.school_id ||
          authUser.app_metadata?.school_id,
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at,
        user_metadata: authUser.user_metadata || {},
        app_metadata: authUser.app_metadata || {},
        mfa_enabled: profile?.mfa_enabled || false,
        last_login_at: authUser.last_sign_in_at || undefined,
        last_login_ip: undefined,
      };

      console.log('🔐 AuthState: User data processed:', {
        email: userData.email,
        role: userData.role,
        school_id: userData.school_id,
        hasProfile: !!profile
      });

      setUser(userData);
      setError(null);
      setIsLoading(false);
    } catch (err: any) {
      console.error('🔐 AuthState: User processing failed:', err);
      if (isMountedRef.current) {
        setError('User processing failed: ' + (err.message || 'Unknown error'));
        setIsLoading(false);
      }
    }
  }, [fetchProfile]);

  useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;
    isMountedRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log('🔐 AuthState: Setting up auth listener');
        
        // Set a hard timeout for the entire auth initialization
        timeoutRef.current = setTimeout(() => {
          console.error('🔐 AuthState: Auth initialization timeout after 15 seconds');
          if (isMountedRef.current) {
            setError('Authentication initialization timeout');
            setIsLoading(false);
          }
        }, 15000);

        // Clean up existing subscription
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔐 AuthState: Auth event:', event, !!session);
            if (!isMountedRef.current) return;
            
            // Clear timeout since we got a response
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            
            if (event === 'SIGNED_OUT' || !session) {
              await processUser(null);
            } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
              await processUser(session.user);
            }
          }
        );
        subscriptionRef.current = subscription;

        // Get initial session with timeout
        console.log('🔐 AuthState: Getting initial session');
        const sessionTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session fetch timeout')), 8000)
        );

        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          sessionTimeout
        ]) as any;

        if (!isMountedRef.current) return;

        // Clear timeout since we got a response
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (sessionError) {
          console.error('🔐 AuthState: Session error:', sessionError);
          throw sessionError;
        }

        if (session?.user) {
          await processUser(session.user);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('🔐 AuthState: Auth initialization failed:', err);
        if (isMountedRef.current) {
          setError('Authentication initialization failed');
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
  }, [processUser]);

  return {
    user,
    isLoading,
    error,
  };
};
