
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';

interface UseAuthStateListenerParams {
  setUser: (user: AuthUser | null) => void;
  setIsLoading: (loading: boolean) => void;
  fetchUserProfile: (authUser: any) => Promise<void>;
}

export const useAuthStateListener = ({
  setUser,
  setIsLoading,
  fetchUserProfile
}: UseAuthStateListenerParams) => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    console.log('🔐 AuthStateListener: Setting up auth state listener');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 AuthStateListener: Error getting initial session:', error);
        }
        
        if (!isMountedRef.current) return;
        
        if (session?.user) {
          console.log('🔐 AuthStateListener: Found initial session for user:', session.user.email);
          await fetchUserProfile(session.user);
        } else {
          console.log('🔐 AuthStateListener: No initial session found');
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('🔐 AuthStateListener: Exception getting initial session:', error);
        if (isMountedRef.current) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;
      
      console.log('🔐 AuthStateListener: Auth state changed:', event, 'session:', !!session);
      
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔐 AuthStateListener: User signed in:', session.user.email);
          // Defer profile fetch to avoid deadlocks
          setTimeout(async () => {
            if (isMountedRef.current) {
              await fetchUserProfile(session.user);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('🔐 AuthStateListener: User signed out or session cleared');
          if (isMountedRef.current) {
            setUser(null);
            setIsLoading(false);
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔐 AuthStateListener: Token refreshed for user:', session.user.email);
          // Update user data after token refresh
          if (isMountedRef.current) {
            await fetchUserProfile(session.user);
          }
        }
      } catch (error) {
        console.error('🔐 AuthStateListener: Error in auth state change handler:', error);
        if (isMountedRef.current) {
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    // Get initial session
    getInitialSession();

    // Cleanup function
    return () => {
      console.log('🔐 AuthStateListener: Cleaning up auth state listener');
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [setUser, setIsLoading, fetchUserProfile]);

  return {
    cleanup: () => {
      isMountedRef.current = false;
    }
  };
};
