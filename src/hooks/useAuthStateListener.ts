
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAuthStateListenerProps {
  setUser: (user: any) => void;
  setIsLoading: (loading: boolean) => void;
  fetchUserProfile: (user: any) => Promise<void>;
}

export const useAuthStateListener = ({ 
  setUser, 
  setIsLoading, 
  fetchUserProfile 
}: UseAuthStateListenerProps) => {
  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing authentication state listener');
    
    let isMounted = true;
    let isInitialized = false;

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthProvider: Auth state changed', { 
        event, 
        hasUser: !!session?.user, 
        userEmail: session?.user?.email,
        isInitialized
      });
      
      if (!isMounted) return;

      // Skip processing during initial session check to avoid double processing
      if (!isInitialized && event === 'INITIAL_SESSION') {
        return;
      }

      if (event === 'SIGNED_OUT' || !session?.user) {
        console.log('🔐 AuthProvider: User signed out or no session');
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && session?.user)) {
        console.log('🔐 AuthProvider: User authenticated, fetching profile');
        
        if (session?.user && isMounted) {
          try {
            await fetchUserProfile(session.user);
          } catch (error) {
            console.error('🔐 AuthProvider: Error fetching profile:', error);
            // Set fallback user data
            setUser({
              ...session.user,
              role: 'parent',
              name: session.user.email?.split('@')[0] || 'User'
            });
            setIsLoading(false);
          }
        }
      }
    });

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('🔐 AuthProvider: Getting initial session');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 AuthProvider: Session error:', error);
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (!isMounted) return;

        console.log('🔐 AuthProvider: Initial session check', { 
          hasSession: !!session,
          hasUser: !!session?.user 
        });
        
        isInitialized = true;
        
        if (session?.user) {
          try {
            await fetchUserProfile(session.user);
          } catch (error) {
            console.error('🔐 AuthProvider: Error fetching profile during init:', error);
            // Set fallback user data
            setUser({
              ...session.user,
              role: 'parent',
              name: session.user.email?.split('@')[0] || 'User'
            });
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('🔐 AuthProvider: Exception during initialization:', error);
        if (isMounted) {
          isInitialized = true;
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth state listener');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, setUser, setIsLoading]);
};
