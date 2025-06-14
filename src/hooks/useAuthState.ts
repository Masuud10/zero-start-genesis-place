
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
  const initializedRef = useRef(false);

  const processUser = async (authUser: SupabaseUser | null): Promise<void> => {
    if (!isMountedRef.current) return;
    
    console.log('🔐 AuthState: Processing user:', authUser?.email || 'null');
    
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
        console.error('🔐 AuthState: User has no email address');
        if (isMountedRef.current) {
          setError('User account is missing email address');
          setIsLoading(false);
        }
        return;
      }

      setError(null);
      
      // Fetch profile with simplified approach
      let profile = null;
      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('role, name, school_id, avatar_url, mfa_enabled')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (!profileError && data) {
          profile = data;
        }
      } catch (err: any) {
        console.warn('🔐 AuthState: Profile fetch failed, continuing with defaults:', err.message);
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
      
      console.log('🔐 AuthState: User processed successfully:', {
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
      console.error('🔐 AuthState: Error processing user:', error);
      if (isMountedRef.current) {
        setError(`User processing failed: ${error.message}`);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let subscription: any = null;
    let timeoutId: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      if (initializedRef.current) return;
      
      try {
        console.log('🔐 AuthState: Initializing auth state');
        
        // Shorter timeout to prevent long loading
        timeoutId = setTimeout(() => {
          if (isMountedRef.current && isLoading) {
            console.warn('🔐 AuthState: Auth initialization timeout, stopping loading');
            setIsLoading(false);
            setError(null);
          }
        }, 3000); // Reduced to 3 seconds
        
        // Set up auth listener
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMountedRef.current) return;
            
            console.log('🔐 AuthState: Auth state changed:', event);
            
            if (event === 'SIGNED_OUT' || !session) {
              console.log('🔐 AuthState: User signed out');
              if (isMountedRef.current) {
                setUser(null);
                setError(null);
                setIsLoading(false);
              }
            } else if (session?.user) {
              // Process user in next tick to prevent blocking
              setTimeout(async () => {
                if (isMountedRef.current) {
                  await processUser(session.user);
                }
              }, 0);
            }
          }
        );
        
        subscription = authSubscription;
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('🔐 AuthState: Session error:', sessionError);
          if (isMountedRef.current) {
            setError(`Session error: ${sessionError.message}`);
            setIsLoading(false);
          }
          return;
        }
        
        // Process initial user
        await processUser(session?.user || null);
        
        initializedRef.current = true;
        
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
      } catch (error: any) {
        console.error('🔐 AuthState: Init error:', error);
        if (isMountedRef.current) {
          setError(`Auth init failed: ${error.message}`);
          setIsLoading(false);
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };
    
    initializeAuth();
    
    return () => {
      console.log('🔐 AuthState: Cleaning up');
      isMountedRef.current = false;
      if (subscription) {
        subscription.unsubscribe();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Reset initialization flag
      setTimeout(() => {
        initializedRef.current = false;
      }, 100);
    };
  }, []); // Run only once

  return {
    user,
    isLoading,
    error
  };
};
