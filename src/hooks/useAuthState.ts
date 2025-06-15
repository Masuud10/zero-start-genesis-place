
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
      try {
        if (!authUser) {
          setUser(null);
          setError(null);
          setIsLoading(false);
          return;
        }

        if (!authUser.email) {
          setError('User account is missing email address');
          setIsLoading(false);
          return;
        }

        // Fetch profile
        let profile = null;
        try {
          const { data, error: profileError } = await Promise.race([
            supabase
              .from('profiles')
              .select('role, name, school_id, avatar_url, mfa_enabled')
              .eq('id', authUser.id)
              .maybeSingle(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
            ),
          ]) as any;
          if (!profileError && data) {
            profile = data;
          }
        } catch (err: any) {}

        // Only mark loading false once profile data (role, school_id) is obtained
        if (!isProfileReady(profile)) {
          setUser(null);
          setError('User profile incomplete or loading');
          setIsLoading(true);
          return;
        }

        const resolvedRole = RoleResolver.resolveRole(authUser, profile.role);

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

        if (isMountedRef.current) {
          setUser(userData);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: any) {
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

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {}
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
