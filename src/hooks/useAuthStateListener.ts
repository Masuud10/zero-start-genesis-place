
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
  const processingRef = useRef(false);
  const currentUserRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    console.log('🔐 AuthStateListener: Setting up auth state listener');
    
    // Get initial session with better error handling
    const getInitialSession = async () => {
      if (initializedRef.current || processingRef.current) {
        console.log('🔐 AuthStateListener: Already initialized/processing, skipping');
        return;
      }
      
      processingRef.current = true;
      
      try {
        console.log('🔐 AuthStateListener: Getting initial session');
        setIsLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 AuthStateListener: Error getting initial session:', error);
        }
        
        if (!isMountedRef.current) {
          console.log('🔐 AuthStateListener: Component unmounted during session fetch');
          return;
        }
        
        if (session?.user) {
          console.log('🔐 AuthStateListener: Found initial session for user:', session.user.email);
          currentUserRef.current = session.user.id;
          
          // Fetch profile with stable reference
          try {
            await fetchUserProfile(session.user);
          } catch (profileError) {
            console.error('🔐 AuthStateListener: Profile fetch failed:', profileError);
            // Set user even if profile fetch fails
            if (isMountedRef.current) {
              setUser({
                ...session.user,
                role: 'parent', // fallback role
                name: session.user.email?.split('@')[0] || 'User'
              } as AuthUser);
              setIsLoading(false);
            }
          }
        } else {
          console.log('🔐 AuthStateListener: No initial session found');
          currentUserRef.current = null;
          setUser(null);
          setIsLoading(false);
        }
        
        initializedRef.current = true;
      } catch (error) {
        console.error('🔐 AuthStateListener: Exception getting initial session:', error);
        if (isMountedRef.current) {
          setUser(null);
          setIsLoading(false);
        }
      } finally {
        processingRef.current = false;
      }
    };

    // Set up auth state change listener with improved handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) {
        console.log('🔐 AuthStateListener: Component unmounted, skipping auth change');
        return;
      }
      
      console.log('🔐 AuthStateListener: Auth state changed:', event, 'session:', !!session);
      
      try {
        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔐 AuthStateListener: User signed in:', session.user.email);
          
          // Only process if this is a different user or we haven't processed this user yet
          if (currentUserRef.current !== session.user.id && !processingRef.current) {
            processingRef.current = true;
            currentUserRef.current = session.user.id;
            
            try {
              await fetchUserProfile(session.user);
            } catch (profileError) {
              console.error('🔐 AuthStateListener: Profile fetch failed during sign in:', profileError);
              // Set fallback user data
              if (isMountedRef.current) {
                setUser({
                  ...session.user,
                  role: 'parent', // fallback role
                  name: session.user.email?.split('@')[0] || 'User'
                } as AuthUser);
                setIsLoading(false);
              }
            } finally {
              processingRef.current = false;
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
          // Only update if we have the same user
          if (currentUserRef.current === session.user.id && !processingRef.current) {
            processingRef.current = true;
            try {
              await fetchUserProfile(session.user);
            } catch (profileError) {
              console.error('🔐 AuthStateListener: Profile fetch failed during token refresh:', profileError);
            } finally {
              processingRef.current = false;
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

    // Get initial session after setting up listener
    getInitialSession();

    // Cleanup function
    return () => {
      console.log('🔐 AuthStateListener: Cleaning up auth state listener');
      isMountedRef.current = false;
      initializedRef.current = false;
      processingRef.current = false;
      currentUserRef.current = null;
      subscription.unsubscribe();
    };
  }, [setUser, setIsLoading, fetchUserProfile]);

  return {
    cleanup: () => {
      isMountedRef.current = false;
      initializedRef.current = false;
      processingRef.current = false;
      currentUserRef.current = null;
    }
  };
};
