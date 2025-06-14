
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

  const processUser = async (authUser: SupabaseUser | null) => {
    if (!isMountedRef.current) return;
    
    console.log('🔐 AuthState: Processing user:', authUser?.email || 'null');
    
    if (!authUser) {
      setUser(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      let profile = null;
      
      // Try to fetch profile data
      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('role, name, school_id, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (profileError) {
          console.warn('🔐 AuthState: Profile fetch error:', profileError);
        } else {
          profile = data;
        }
      } catch (profileError: any) {
        console.warn('🔐 AuthState: Profile fetch failed:', profileError.message);
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
        setError(`Failed to process user: ${error.message}`);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log('🔐 AuthState: Setting up auth state management');
    
    let subscription: any = null;
    
    const setupAuth = async () => {
      try {
        // Set up auth listener first
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMountedRef.current) return;
            
            console.log('🔐 AuthState: Auth state changed:', event, 'hasSession:', !!session);
            
            await processUser(session?.user || null);
          }
        );
        
        subscription = authSubscription;
        
        // Get initial session only if not already initialized
        if (!initializedRef.current && isMountedRef.current) {
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
          
          initializedRef.current = true;
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
  }, []);

  return {
    user,
    isLoading,
    error,
    retry: () => {
      console.log('🔐 AuthState: Retry requested');
      if (user) {
        processUser(user);
      }
    }
  };
};
