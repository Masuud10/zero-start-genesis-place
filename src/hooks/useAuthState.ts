
import { useState, useEffect, useRef } from 'react';
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
  const profileCacheRef = useRef<Map<string, any>>(new Map());

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

  const fetchProfileWithCache = async (userId: string) => {
    // Check cache first
    if (profileCacheRef.current.has(userId)) {
      console.log('🔐 AuthState: Using cached profile for', userId);
      return profileCacheRef.current.get(userId);
    }

    console.log('🔐 AuthState: Fetching fresh profile for', userId);
    try {
      const { data, error } = await Promise.race([
        supabase
          .from('profiles')
          .select('role, name, school_id, avatar_url, mfa_enabled')
          .eq('id', userId)
          .maybeSingle(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        ),
      ]) as any;
      
      if (error) {
        console.error('🔐 AuthState: Profile fetch error:', error);
        return null;
      }

      // Cache the result for 5 minutes
      if (data) {
        profileCacheRef.current.set(userId, data);
        setTimeout(() => {
          profileCacheRef.current.delete(userId);
        }, 5 * 60 * 1000);
      }

      return data;
    } catch (err: any) {
      console.error('🔐 AuthState: Profile fetch exception:', err);
      return null;
    }
  };

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

      // Fetch profile with caching
      const profile = await fetchProfileWithCache(authUser.id);

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

  useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;
    isMountedRef.current = true;

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
            // Clear cache on sign out
            profileCacheRef.current.clear();
            processUser(null);
          } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            processUser(session.user);
          }
        }
      );
      subscriptionRef.current = subscription;

      // Get initial session
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
