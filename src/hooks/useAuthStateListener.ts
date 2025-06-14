
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
  const initializedRef = useRef(false);
  const currentUserRef = useRef<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    console.log('🔐 AuthStateListener: Setting up auth state listener');
    
    // Set up auth state change listener
    const setupAuthListener = () => {
      if (subscriptionRef.current) {
        console.log('🔐 AuthStateListener: Cleaning up existing subscription');
        subscriptionRef.current.unsubscribe();
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMountedRef.current) {
          console.log('🔐 AuthStateListener: Component unmounted, skipping auth change');
          return;
        }
        
        console.log('🔐 AuthStateListener: Auth state changed:', event, 'session:', !!session);
        
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('🔐 AuthStateListener: User signed in:', session.user.email);
            
            if (currentUserRef.current !== session.user.id) {
              currentUserRef.current = session.user.id;
              
              try {
                await fetchUserProfile(session.user);
              } catch (profileError) {
                console.warn('🔐 AuthStateListener: Profile fetch failed during sign in, continuing with basic user data:', profileError);
                if (isMountedRef.current) {
                  setUser({
                    ...session.user,
                    role: 'parent',
                    name: session.user.email?.split('@')[0] || 'User'
                  } as AuthUser);
                  setIsLoading(false);
                }
              }
            }
          } else if (event === 'SIGNED_OUT' || !session) {
            console.log('🔐 AuthStateListener: User signed out or session cleared');
            currentUserRef.current = null;
            if (isMountedRef.current) {
              setUser(null);
              setIsLoading(false);
            }
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            console.log('🔐 AuthStateListener: Token refreshed for user:', session.user.email);
            // Skip profile refetch on token refresh to avoid unnecessary calls
            if (currentUserRef.current !== session.user.id) {
              currentUserRef.current = session.user.id;
              try {
                await fetchUserProfile(session.user);
              } catch (profileError) {
                console.warn('🔐 AuthStateListener: Profile fetch failed during token refresh:', profileError);
              }
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

      subscriptionRef.current = subscription;
      return subscription;
    };

    // Get initial session with improved error handling
    const getInitialSession = async () => {
      if (initializedRef.current) {
        console.log('🔐 AuthStateListener: Already initialized, skipping');
        return;
      }
      
      try {
        console.log('🔐 AuthStateListener: Getting initial session');
        setIsLoading(true);
        
        // Use Promise.race for timeout instead of abortSignal
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 6000)
        );
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error && error.message !== 'Session timeout') {
          console.warn('🔐 AuthStateListener: Error getting initial session:', error);
        }
        
        if (!isMountedRef.current) {
          console.log('🔐 AuthStateListener: Component unmounted during session fetch');
          return;
        }
        
        if (session?.user) {
          console.log('🔐 AuthStateListener: Found initial session for user:', session.user.email);
          currentUserRef.current = session.user.id;
          
          try {
            await fetchUserProfile(session.user);
          } catch (profileError) {
            console.warn('🔐 AuthStateListener: Profile fetch failed for initial session, using fallback:', profileError);
            if (isMountedRef.current) {
              setUser({
                ...session.user,
                role: 'parent',
                name: session.user.email?.split('@')[0] || 'User'
              } as AuthUser);
              setIsLoading(false);
            }
          }
        } else {
          console.log('🔐 AuthStateListener: No initial session found');
          currentUserRef.current = null;
          if (isMountedRef.current) {
            setUser(null);
            setIsLoading(false);
          }
        }
        
        initializedRef.current = true;
      } catch (error: any) {
        if (error.message !== 'Session timeout') {
          console.warn('🔐 AuthStateListener: Exception getting initial session, proceeding without session:', error);
        }
        if (isMountedRef.current) {
          setUser(null);
          setIsLoading(false);
          initializedRef.current = true;
        }
      }
    };

    // Set up listener first, then get initial session
    setupAuthListener();
    getInitialSession();

    // Cleanup function
    return () => {
      console.log('🔐 AuthStateListener: Starting cleanup');
      isMountedRef.current = false;
      
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      // Reset refs after a delay to prevent race conditions
      setTimeout(() => {
        initializedRef.current = false;
        currentUserRef.current = null;
      }, 200);
    };
  }, [setUser, setIsLoading, fetchUserProfile]);

  return {
    cleanup: () => {
      console.log('🔐 AuthStateListener: Manual cleanup requested');
      isMountedRef.current = false;
      
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    }
  };
};
