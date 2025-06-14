
import { useState, useEffect, useRef } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { RoleResolver } from '@/utils/roleResolver';

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isMountedRef = useRef(true);
  const processedUserRef = useRef<string | null>(null);

  const processUser = async (authUser: SupabaseUser | null) => {
    if (!isMountedRef.current) return;
    
    if (!authUser) {
      console.log('🔐 AuthState: No auth user, clearing state');
      setUser(null);
      setIsLoading(false);
      setError(null);
      processedUserRef.current = null;
      return;
    }

    // Avoid duplicate processing
    if (processedUserRef.current === authUser.id) {
      console.log('🔐 AuthState: User already processed, skipping:', authUser.id);
      return;
    }
    
    processedUserRef.current = authUser.id;
    
    try {
      console.log('🔐 AuthState: Processing user:', {
        email: authUser.email,
        id: authUser.id,
        userMetadata: authUser.user_metadata,
        appMetadata: authUser.app_metadata
      });
      
      let profile = null;
      
      // Try to fetch profile with timeout and proper error handling
      try {
        console.log('🔐 AuthState: Fetching profile for user:', authUser.id);
        
        const profilePromise = supabase
          .from('profiles')
          .select('role, name, school_id, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle();
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout after 8 seconds')), 8000)
        );
        
        const result = await Promise.race([profilePromise, timeoutPromise]) as any;
        
        if (result.error) {
          console.warn('🔐 AuthState: Profile fetch error:', result.error);
        } else {
          profile = result.data;
          console.log('🔐 AuthState: Profile fetched successfully:', profile);
        }
        
      } catch (profileError: any) {
        console.warn('🔐 AuthState: Profile fetch failed, continuing with auth data only:', profileError.message);
      }
      
      // Get detailed role information using the improved resolver
      const roleInfo = RoleResolver.getRoleInfo(authUser, profile?.role);
      console.log('🔐 AuthState: Role resolution result:', roleInfo);
      
      // Construct user data with all available information
      const userData: AuthUser = {
        ...authUser,
        role: roleInfo.role,
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
        roleSource: roleInfo.source,
        school_id: userData.school_id,
        hasProfile: !!profile,
        roleDebugInfo: roleInfo.debugInfo
      });
      
      if (isMountedRef.current) {
        setUser(userData);
        setError(null);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('🔐 AuthState: Error processing user:', error);
      if (isMountedRef.current) {
        setError(`Failed to load user profile: ${error.message}`);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    console.log('🔐 AuthState: Setting up auth state management');
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AuthState: Auth state changed:', event, 'hasSession:', !!session);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('🔐 AuthState: User signed out or no session');
          setUser(null);
          setIsLoading(false);
          setError(null);
          processedUserRef.current = null;
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('🔐 AuthState: Processing auth state change for:', event);
          await processUser(session.user);
        }
      }
    );
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔐 AuthState: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('🔐 AuthState: Initial session error:', error);
        }
        
        await processUser(session?.user || null);
      } catch (error: any) {
        console.error('🔐 AuthState: Error getting initial session:', error);
        if (isMountedRef.current) {
          setError(`Failed to initialize session: ${error.message}`);
          setIsLoading(false);
        }
      }
    };
    
    getInitialSession();
    
    return () => {
      console.log('🔐 AuthState: Cleaning up auth state management');
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    error,
    retry: () => {
      console.log('🔐 AuthState: Retry requested');
      if (user) {
        processedUserRef.current = null;
        processUser(user);
      }
    }
  };
};
