
import { useState, useEffect, useRef } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { RoleResolver } from '@/utils/roleResolver';

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize all refs at the top level
  const isMountedRef = useRef(true);
  const initializedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const subscriptionRef = useRef<any>(null);

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
      
      // Fetch profile with better error handling
      let profile = null;
      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('role, name, school_id, avatar_url, mfa_enabled')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (profileError) {
          console.warn('🔐 AuthState: Profile fetch error:', profileError.message);
        } else if (data) {
          profile = data;
        }
      } catch (err: any) {
        console.warn('🔐 AuthState: Profile fetch failed:', err.message);
      }
      
      // Resolve role with fallback
      const resolvedRole = RoleResolver.resolveRole(authUser, profile?.role);
      
      // Create user data with sensible defaults
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

  // Single useEffect that runs once
  useEffect(() => {
    // Reset mounted state
    isMountedRef.current = true;
    
    // Skip if already initialized
    if (initializedRef.current) {
      console.log('🔐 AuthState: Already initialized, skipping');
      return;
    }
    
    console.log('🔐 AuthState: Initializing auth state');
    
    const initializeAuth = async () => {
      try {
        // Set timeout to prevent infinite loading
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && isLoading) {
            console.warn('🔐 AuthState: Auth timeout, setting loading to false');
            setIsLoading(false);
            setError(null);
            setUser(null);
          }
        }, 8000);
        
        // Set up auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMountedRef.current) return;
            
            console.log('🔐 AuthState: Auth state changed:', event);
            
            // Clear timeout on any auth event
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = undefined;
            }
            
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
    
    // Cleanup function
    return () => {
      console.log('🔐 AuthState: Cleaning up');
      isMountedRef.current = false;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      // Reset initialization flag after cleanup
      setTimeout(() => {
        initializedRef.current = false;
      }, 100);
    };
  }, []); // Empty dependency array - only run once

  return {
    user,
    isLoading,
    error
  };
};
