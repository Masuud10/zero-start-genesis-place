
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

  // LOG: Mount/Unmount
  useEffect(() => {
    console.log('[useAuthState] effect mounted');
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
      console.log('[useAuthState] effect unmounted/cleaned up');
    };
  }, []);

  useEffect(() => {
    if (initializedRef.current) {
      console.log('[useAuthState] already initialized, skipping');
      return;
    }

    console.log('[useAuthState] INITIALIZING HOOK');
    initializedRef.current = true;
    isMountedRef.current = true;

    const processUser = async (authUser: SupabaseUser | null) => {
      if (!isMountedRef.current) { 
        console.warn('[useAuthState] abort processUser: not mounted');
        return; 
      }
      try {
        if (!authUser) {
          console.log('[useAuthState] processUser: no user');
          setUser(null);
          setError(null);
          setIsLoading(false);
          return;
        }

        console.log('[useAuthState] processUser: loading user', authUser.email);

        if (!authUser.email) {
          setError('User account is missing email address');
          setIsLoading(false);
          return;
        }

        // --- Profile fetch with timeout
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
          
          if (profileError && !profileError.message.includes('timeout')) {
            console.warn('[useAuthState] profile fetch error:', profileError.message);
          } else {
            profile = data;
          }
        } catch (err: any) {
          console.warn('[useAuthState] profile fetch failed:', err.message);
        }

        // --- Role resolving and user construction
        const resolvedRole = RoleResolver.resolveRole(authUser, profile?.role);

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

        console.log('[useAuthState] processed user:', {
          email: userData.email,
          role: userData.role,
          school_id: userData.school_id,
        });

        if (isMountedRef.current) {
          setUser(userData);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('[useAuthState] exception processing user:', err);
        if (isMountedRef.current) {
          setError('User processing failed: ' + (err.message || 'Unknown error'));
          setIsLoading(false);
        }
      }
    };

    // -- AUTH STATE CHANGE SUBSCRIPTION --
    const initializeAuth = async () => {
      try {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }

        // SUBSCRIBE TO AUTH STATE CHANGES
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isMountedRef.current) return;
            console.log('[useAuthState] auth state changed:', event, 'hasSession:', !!session);

            if (event === 'SIGNED_OUT' || !session) {
              processUser(null);
            } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
              processUser(session.user);
            }
          }
        );
        subscriptionRef.current = subscription;

        // -- INITIAL SESSION FETCH
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('[useAuthState] session error', sessionError);
        }
        if (session?.user && isMountedRef.current) {
          await processUser(session.user);
        } else if (isMountedRef.current) {
          setUser(null);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('[useAuthState] initialization exception:', err);
        if (isMountedRef.current) {
          setError('Auth initialization failed');
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    // Unmount cleanup is already handled in the mounting effect!
  }, []);

  return {
    user,
    isLoading,
    error,
  };
};
