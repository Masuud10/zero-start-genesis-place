
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

      // Ensure email is present
      if (!authUser.email) {
        console.error('🔐 AuthState: User has no email address');
        if (isMountedRef.current) {
          setError('User account is missing email address');
          setIsLoading(false);
        }
        return;
      }

      setError(null);
      
      // Fetch profile with timeout using Promise.race
      let profile = null;
      try {
        const profilePromise = supabase
          .from('profiles')
          .select('role, name, school_id, avatar_url, mfa_enabled')
          .eq('id', authUser.id)
          .maybeSingle();
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
        );
        
        const { data, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('🔐 AuthState: Profile fetch error (continuing):', profileError.message);
        } else if (data) {
          profile = data;
          console.log('🔐 AuthState: Profile loaded:', { role: data.role, school_id: data.school_id });
        }
      } catch (err: any) {
        if (err.message !== 'Profile fetch timeout') {
          console.warn('🔐 AuthState: Profile fetch failed (continuing):', err.message);
        }
      }
      
      // Resolve role
      const resolvedRole = RoleResolver.resolveRole(authUser, profile?.role);
      
      // Create user data with guaranteed email and all metadata
      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email, // Now guaranteed to exist
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
        // Include all metadata for compatibility
        user_metadata: authUser.user_metadata || {},
        app_metadata: authUser.app_metadata || {},
        // Security properties from profile or metadata
        mfa_enabled: profile?.mfa_enabled || false,
        last_login_at: authUser.last_sign_in_at || undefined,
        last_login_ip: undefined // This would come from custom tracking
      };
      
      console.log('🔐 AuthState: User processed successfully:', {
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
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMountedRef.current && isLoading) {
            console.warn('🔐 AuthState: Auth initialization timeout');
            setIsLoading(false);
            setError('Authentication timeout - please refresh the page');
          }
        }, 8000);
        
        // Set up auth listener first
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMountedRef.current) return;
            
            console.log('🔐 AuthState: Auth state changed:', event);
            
            // Process auth changes with timeout to prevent blocking
            setTimeout(async () => {
              if (isMountedRef.current) {
                await processUser(session?.user || null);
              }
            }, 0);
          }
        );
        
        subscription = authSubscription;
        
        // Get initial session with timeout using Promise.race
        const sessionPromise = supabase.auth.getSession();
        const sessionTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          sessionTimeoutPromise
        ]) as any;
        
        if (sessionError && sessionError.message !== 'Session timeout') {
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
        
        // Clear timeout if we reached this point
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
      } catch (error: any) {
        console.error('🔐 AuthState: Init error:', error);
        if (isMountedRef.current) {
          if (error.message !== 'Session timeout') {
            setError(`Auth init failed: ${error.message}`);
          }
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
      // Reset refs to prevent memory leaks
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
