
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
  const hasInitializedRef = useRef(false);

  const processUser = async (authUser: SupabaseUser | null) => {
    if (!isMountedRef.current) return;
    
    console.log('🔐 AuthState: Processing user:', authUser?.email || 'null');
    
    if (!authUser) {
      console.log('🔐 AuthState: No auth user, clearing state');
      setUser(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      let profile = null;
      
      // Fetch profile data with timeout
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        );
        
        const profilePromise = supabase
          .from('profiles')
          .select('role, name, school_id, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle();
        
        const { data, error: profileError } = await Promise.race([profilePromise, timeoutPromise]) as any;
        
        if (profileError && !profileError.message.includes('timeout')) {
          console.warn('🔐 AuthState: Profile fetch error:', profileError);
        } else if (data) {
          profile = data;
          console.log('🔐 AuthState: Profile loaded:', { role: data.role, school_id: data.school_id });
        }
      } catch (profileError: any) {
        console.warn('🔐 AuthState: Profile fetch failed:', profileError.message);
        // Continue without profile - we'll use fallback role detection
      }
      
      // Resolve role using the role resolver
      const resolvedRole = RoleResolver.resolveRole(authUser, profile?.role);
      
      // Create user data
      const userData: AuthUser = {
        ...authUser,
        role: resolvedRole,
        name: profile?.name || 
              authUser.user_metadata?.name || 
              authUser.user_metadata?.full_name ||
              authUser.email?.split('@')[0] || 
              'User',
        school_id: profile?.school_id || 
                   authUser.user_metadata?.school_id || 
                   authUser.app_metadata?.school_id,
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url
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
    
    const setupAuth = async () => {
      try {
        console.log('🔐 AuthState: Setting up auth state management');
        
        // Set up auth listener first
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMountedRef.current) return;
            
            console.log('🔐 AuthState: Auth state changed:', event, 'hasSession:', !!session);
            
            // Only process if this is a significant change
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
              await processUser(session?.user || null);
            }
          }
        );
        
        subscription = authSubscription;
        
        // Get initial session only once
        if (!hasInitializedRef.current && isMountedRef.current) {
          console.log('🔐 AuthState: Getting initial session');
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.warn('🔐 AuthState: Initial session error:', sessionError);
            if (isMountedRef.current) {
              setError(`Session error: ${sessionError.message}`);
              setIsLoading(false);
            }
          } else {
            await processUser(session?.user || null);
          }
          
          hasInitializedRef.current = true;
        }
      } catch (error: any) {
        console.error('🔐 AuthState: Error in auth setup:', error);
        if (isMountedRef.current) {
          setError(`Auth setup failed: ${error.message}`);
          setIsLoading(false);
        }
      }
    };
    
    setupAuth();
    
    return () => {
      console.log('🔐 AuthState: Cleaning up auth state management');
      isMountedRef.current = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array - only run once

  return {
    user,
    isLoading,
    error
  };
};
