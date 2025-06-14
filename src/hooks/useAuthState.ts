
import { useState, useEffect, useRef } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { RoleResolver } from '@/utils/roleResolver';

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Single ref to track if we're mounted and initialized
  const isMountedRef = useRef(true);
  const initializedRef = useRef(false);
  const subscriptionRef = useRef<any>(null);

  const processUser = async (authUser: SupabaseUser | null): Promise<void> => {
    if (!isMountedRef.current) return;
    
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

      // Fetch profile data
      let profile = null;
      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('role, name, school_id, avatar_url, mfa_enabled')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (profileError) {
          console.warn('🔐 AuthState: Profile fetch error:', profileError.message);
        } else {
          profile = data;
        }
      } catch (err: any) {
        console.warn('🔐 AuthState: Profile fetch failed:', err.message);
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
    isMountedRef.current = true;
    
    // Only initialize once
    if (initializedRef.current) {
      return;
    }
    
    console.log('🔐 AuthState: Initializing auth state');
    
    const initializeAuth = async () => {
      try {
        // Clean up any existing subscription
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
        
        // Set up auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMountedRef.current) return;
            
            console.log('🔐 AuthState: Auth state changed:', event);
            
            if (event === 'SIGNED_OUT' || !session) {
              await processUser(null);
            } else if (session?.user) {
              await processUser(session.user);
            }
          }
        );
        
        subscriptionRef.current = subscription;
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('🔐 AuthState: Session error:', sessionError);
          if (isMountedRef.current) {
            setError(null);
            setIsLoading(false);
          }
          return;
        }
        
        // Process initial user
        await processUser(session?.user || null);
        
        // Mark as initialized
        initializedRef.current = true;
        
      } catch (error: any) {
        console.error('🔐 AuthState: Init error:', error);
        if (isMountedRef.current) {
          setError(null);
          setIsLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    return () => {
      console.log('🔐 AuthState: Cleaning up');
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
