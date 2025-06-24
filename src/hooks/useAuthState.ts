
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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<any> => {
    console.log('🔐 AuthState: Fetching profile for', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name, school_id, avatar_url, mfa_enabled, status')
        .eq('id', userId)
        .single();
      
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
      const profile = await Promise.race([
        fetchProfile(authUser.id),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile timeout')), 3000)
        )
      ]).catch(() => null);

      if (!isMountedRef.current) return;

      // Create user data with proper role handling
      let resolvedRole = profile?.role;
      
      // If no role in profile, determine from email or metadata
      if (!resolvedRole) {
        resolvedRole = authUser.user_metadata?.role || 
                     authUser.app_metadata?.role;
        
        // Email-based role detection as fallback
        if (!resolvedRole) {
          if (authUser.email.includes('admin@edufam') || authUser.email === 'masuud@gmail.com') {
            resolvedRole = 'edufam_admin';
          } else if (authUser.email.includes('elimisha')) {
            resolvedRole = 'elimisha_admin';
          } else if (authUser.email.includes('principal')) {
            resolvedRole = 'principal';
          } else if (authUser.email.includes('teacher')) {
            resolvedRole = 'teacher';
          } else {
            resolvedRole = 'parent';
          }
          
          // Update profile with determined role
          if (profile) {
            await supabase
              .from('profiles')
              .update({ role: resolvedRole })
              .eq('id', authUser.id);
          }
        }
      }

      // Determine school assignment
      let userSchoolId = profile?.school_id ||
                        authUser.user_metadata?.school_id ||
                        authUser.app_metadata?.school_id;

      // For non-admin roles without school, assign to first available school
      if (!['elimisha_admin', 'edufam_admin'].includes(resolvedRole) && !userSchoolId) {
        const { data: schools } = await supabase
          .from('schools')
          .select('id')
          .order('created_at')
          .limit(1);
        
        if (schools && schools.length > 0) {
          userSchoolId = schools[0].id;
          
          // Update profile with school assignment
          await supabase
            .from('profiles')
            .update({ school_id: userSchoolId })
            .eq('id', authUser.id);
        }
      }

      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email,
        role: resolvedRole,
        name: profile?.name ||
              authUser.user_metadata?.name ||
              authUser.user_metadata?.full_name ||
              authUser.email.split('@')[0] ||
              'User',
        school_id: userSchoolId,
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
        
        // Clean up existing subscription
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔐 AuthState: Auth event:', event, !!session);
            if (!isMountedRef.current) return;
            
            if (event === 'SIGNED_OUT' || !session) {
              await processUser(null);
            } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
              await processUser(session.user);
            }
          }
        );
        subscriptionRef.current = subscription;

        // Get initial session
        console.log('🔐 AuthState: Getting initial session');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (!isMountedRef.current) return;

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
          setError('Authentication failed - please refresh the page');
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
