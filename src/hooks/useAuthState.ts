
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
  const initializedRef = useRef(false);

  const processUser = async (authUser: SupabaseUser | null, skipDuplicateCheck = false) => {
    if (!isMountedRef.current) return;
    
    if (!authUser) {
      console.log('🔐 AuthState: No auth user, clearing state');
      setUser(null);
      setIsLoading(false);
      setError(null);
      processedUserRef.current = null;
      return;
    }

    // Avoid duplicate processing unless explicitly requested
    if (!skipDuplicateCheck && processedUserRef.current === authUser.id) {
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
      
      // Try to fetch profile with proper error handling
      try {
        console.log('🔐 AuthState: Fetching profile for user:', authUser.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('role, name, school_id, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (error) {
          console.warn('🔐 AuthState: Profile fetch error:', error);
        } else {
          profile = data;
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
    if (!isMountedRef.current) return;
    
    console.log('🔐 AuthState: Setting up auth state management');
    
    let subscription: any = null;
    
    const setupAuth = async () => {
      try {
        // Set up auth listener first
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMountedRef.current) return;
            
            console.log('🔐 AuthState: Auth state changed:', event, 'hasSession:', !!session);
            
            if (event === 'SIGNED_OUT' || !session?.user) {
              console.log('🔐 AuthState: User signed out or no session');
              setUser(null);
              setIsLoading(false);
              setError(null);
              processedUserRef.current = null;
              return;
            }
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
              console.log('🔐 AuthState: Processing auth state change for:', event);
              await processUser(session.user, event === 'INITIAL_SESSION');
            }
          }
        );
        
        subscription = authSubscription;
        
        // Then get initial session
        if (!initializedRef.current) {
          console.log('🔐 AuthState: Getting initial session');
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.warn('🔐 AuthState: Initial session error:', error);
            if (isMountedRef.current) {
              setError(`Failed to get session: ${error.message}`);
              setIsLoading(false);
            }
          } else {
            await processUser(session?.user || null, true);
          }
          
          initializedRef.current = true;
        }
      } catch (error: any) {
        console.error('🔐 AuthState: Error in auth setup:', error);
        if (isMountedRef.current) {
          setError(`Failed to initialize auth: ${error.message}`);
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
        processedUserRef.current = null;
        processUser(user, true);
      }
    }
  };
};
