
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
    
    if (!authUser) {
      console.log('🔐 AuthState: No auth user, clearing state');
      setUser(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch profile with a simple timeout
      let profile = null;
      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('role, name, school_id, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (profileError) {
          console.warn('🔐 AuthState: Profile fetch error (continuing):', profileError.message);
        } else if (data) {
          profile = data;
          console.log('🔐 AuthState: Profile loaded:', { role: data.role, school_id: data.school_id });
        }
      } catch (err: any) {
        console.warn('🔐 AuthState: Profile fetch failed (continuing):', err.message);
      }
      
      // Resolve role
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
    
    const initializeAuth = async () => {
      if (initializedRef.current) return;
      
      try {
        console.log('🔐 AuthState: Initializing auth state');
        
        // Get initial session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('🔐 AuthState: Session error:', sessionError);
          setError(`Session error: ${sessionError.message}`);
          setIsLoading(false);
          return;
        }
        
        // Process initial user
        await processUser(session?.user || null);
        
        // Set up auth listener
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMountedRef.current) return;
            
            console.log('🔐 AuthState: Auth state changed:', event);
            
            // Only process significant changes
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
              // Use setTimeout to prevent blocking
              setTimeout(() => {
                if (isMountedRef.current) {
                  processUser(session?.user || null);
                }
              }, 0);
            }
          }
        );
        
        subscription = authSubscription;
        initializedRef.current = true;
        
      } catch (error: any) {
        console.error('🔐 AuthState: Init error:', error);
        if (isMountedRef.current) {
          setError(`Auth init failed: ${error.message}`);
          setIsLoading(false);
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
    };
  }, []); // Run only once

  return {
    user,
    isLoading,
    error
  };
};
