
import { useState, useEffect, useRef } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { RoleResolver } from '@/utils/roleResolver';

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      setTimeout(() => {
        initializedRef.current = false;
      }, 100);
    };
  }, []);

  // Helper: returns true when essential user metadata is loaded
  const isProfileReady = (profile: any) => {
    return (
      profile &&
      typeof profile.role === 'string' &&
      (profile.school_id !== undefined)
    );
  };

  useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;
    isMountedRef.current = true;

    const processUser = async (authUser: SupabaseUser | null) => {
      if (!isMountedRef.current) return;
      
      console.log('🔐 AuthState: Processing user', authUser?.email);
      
      try {
        if (!authUser) {
          console.log('🔐 AuthState: No auth user, clearing state');
          setUser(null);
          setError(null);
          setIsLoading(false);
          return;
        }

        if (!authUser.email) {
          console.error('🔐 AuthState: User missing email');
          setError('User account is missing email address');
          setIsLoading(false);
          return;
        }

        // Fetch profile with timeout
        let profile = null;
        try {
          console.log('🔐 AuthState: Fetching profile for', authUser.id);
          const { data, error: profileError } = await Promise.race([
            supabase
              .from('profiles')
              .select('role, name, school_id, avatar_url, mfa_enabled')
              .eq('id', authUser.id)
              .maybeSingle(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
            ),
          ]) as any;
          
          if (profileError) {
            console.error('🔐 AuthState: Profile fetch error:', profileError);
          } else if (data) {
            profile = data;
            console.log('🔐 AuthState: Profile loaded:', { role: profile.role, school_id: profile.school_id });
          } else {
            console.warn('🔐 AuthState: No profile found for user');
          }
        } catch (err: any) {
          console.error('🔐 AuthState: Profile fetch exception:', err);
        }

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

        if (isMountedRef.current) {
          setUser(userData);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('🔐 AuthState: User processing failed:', err);
        if (isMountedRef.current) {
          setError('User processing failed: ' + (err.message || 'Unknown error'));
          setIsLoading(false);
        }
      }
    };

    // Subscribe to auth changes
    const initializeAuth = async () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      console.log('🔐 AuthState: Setting up auth listener');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('🔐 AuthState: Auth event:', event, !!session);
          if (!isMountedRef.current) return;
          if (event === 'SIGNED_OUT' || !session) {
            processUser(null);
          } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            processUser(session.user);
          }
        }
      );
      subscriptionRef.current = subscription;

      // First fetch (after mount or login)
      console.log('🔐 AuthState: Getting initial session');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('🔐 AuthState: Session error:', sessionError);
      }
      if (session?.user && isMountedRef.current) {
        await processUser(session.user);
      } else if (isMountedRef.current) {
        setUser(null);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return {
    user,
    isLoading,
    error,
  };
};
