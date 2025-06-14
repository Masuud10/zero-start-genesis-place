
import { useState, useEffect, useRef } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { RoleResolver } from '@/utils/roleResolver';

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent multiple initializations
  const isMountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);
  const initializedRef = useRef(false);

  console.log('🔐 useAuthState: Hook called, isLoading:', isLoading, 'hasUser:', !!user);

  useEffect(() => {
    if (initializedRef.current) {
      console.log('🔐 useAuthState: Already initialized, skipping');
      return;
    }

    console.log('🔐 useAuthState: Starting initialization');
    isMountedRef.current = true;
    
    const initializeAuth = async () => {
      try {
        // Clean up any existing subscription first
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }

        // Get initial session
        console.log('🔐 useAuthState: Getting initial session');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('🔐 useAuthState: Session error:', sessionError);
          if (isMountedRef.current) {
            setError(null); // Don't treat session errors as critical
            setIsLoading(false);
          }
          return;
        }

        // Process initial user
        if (session?.user && isMountedRef.current) {
          console.log('🔐 useAuthState: Processing initial user:', session.user.email);
          await processUser(session.user);
        } else if (isMountedRef.current) {
          console.log('🔐 useAuthState: No initial session found');
          setUser(null);
          setIsLoading(false);
        }

        // Set up auth state listener
        console.log('🔐 useAuthState: Setting up auth listener');
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMountedRef.current) return;
            
            console.log('🔐 useAuthState: Auth state changed:', event);
            
            if (event === 'SIGNED_OUT' || !session) {
              console.log('🔐 useAuthState: User signed out');
              setUser(null);
              setError(null);
              setIsLoading(false);
            } else if (session?.user && event === 'SIGNED_IN') {
              console.log('🔐 useAuthState: User signed in, processing...');
              await processUser(session.user);
            } else if (session?.user && event === 'TOKEN_REFRESHED') {
              console.log('🔐 useAuthState: Token refreshed');
              // Don't re-process user on token refresh to avoid unnecessary calls
            }
          }
        );
        
        subscriptionRef.current = subscription;
        initializedRef.current = true;
        
      } catch (error: any) {
        console.error('🔐 useAuthState: Initialization error:', error);
        if (isMountedRef.current) {
          setError(null); // Don't show initialization errors to user
          setIsLoading(false);
        }
      }
    };

    const processUser = async (authUser: SupabaseUser): Promise<void> => {
      if (!isMountedRef.current) return;
      
      try {
        console.log('🔐 useAuthState: Processing user:', authUser.email);

        if (!authUser.email) {
          console.error('🔐 useAuthState: User has no email');
          if (isMountedRef.current) {
            setError('User account is missing email address');
            setIsLoading(false);
          }
          return;
        }

        // Try to fetch profile with timeout
        let profile = null;
        try {
          const profilePromise = supabase
            .from('profiles')
            .select('role, name, school_id, avatar_url, mfa_enabled')
            .eq('id', authUser.id)
            .maybeSingle();
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
          );
          
          const { data, error: profileError } = await Promise.race([
            profilePromise,
            timeoutPromise
          ]) as any;
          
          if (profileError && !profileError.message.includes('timeout')) {
            console.warn('🔐 useAuthState: Profile fetch error:', profileError.message);
          } else {
            profile = data;
          }
        } catch (err: any) {
          console.warn('🔐 useAuthState: Profile fetch failed:', err.message);
        }
        
        // Resolve role
        const resolvedRole = RoleResolver.resolveRole(authUser, profile?.role);
        
        // Create user data
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
          last_login_ip: undefined
        };
        
        console.log('🔐 useAuthState: User processed successfully:', {
          email: userData.email,
          role: userData.role,
          school_id: userData.school_id
        });
        
        if (isMountedRef.current) {
          setUser(userData);
          setError(null);
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('🔐 useAuthState: Error processing user:', error);
        if (isMountedRef.current) {
          setError(`User processing failed: ${error.message}`);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    
    return () => {
      console.log('🔐 useAuthState: Cleaning up');
      isMountedRef.current = false;
      
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  return {
    user,
    isLoading,
    error
  };
};
