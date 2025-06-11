
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
    console.log('🔐 AuthProvider: Initializing authentication');
    
    let isMounted = true;

    // Clear any invalid tokens on startup
    const clearInvalidTokens = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('🔐 AuthProvider: Session error, clearing tokens:', error.message);
          
          if (error.message.includes('Invalid Refresh Token') || 
              error.message.includes('refresh_token_not_found') ||
              error.message.includes('invalid_grant')) {
            console.log('🔐 AuthProvider: Clearing invalid tokens');
            await supabase.auth.signOut();
            
            // Clear localStorage of any auth tokens
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
                localStorage.removeItem(key);
              }
            });
          }
          return null;
        }
        
        return session;
      } catch (err) {
        console.error('🔐 AuthProvider: Error checking session:', err);
        return null;
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthProvider: Auth state changed', { event, user: session?.user?.email });
      
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        console.log('🔐 AuthProvider: User signed out or no session');
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('🔐 AuthProvider: User signed in or token refreshed');
        
        // Defer profile fetching to avoid blocking and potential deadlocks
        setTimeout(() => {
          if (isMounted && session?.user) {
            fetchUserProfile(session.user).catch(error => {
              console.error('🔐 AuthProvider: Error fetching profile in state change:', error);
              // Continue with basic user data even if profile fetch fails
              setUser({
                ...session.user,
                role: 'parent',
                name: session.user.email?.split('@')[0] || 'User'
              });
              setIsLoading(false);
            });
          }
        }, 100);
      }
    });

    // Get initial session with error handling
    const initializeAuth = async () => {
      try {
        console.log('🔐 AuthProvider: Getting initial session');
        const session = await clearInvalidTokens();
        
        if (!isMounted) return;

        console.log('🔐 AuthProvider: Initial session check', { hasSession: !!session });
        
        if (session?.user) {
          // Use setTimeout to prevent potential blocking
          setTimeout(() => {
            if (isMounted) {
              fetchUserProfile(session.user).catch(error => {
                console.error('🔐 AuthProvider: Error fetching profile during init:', error);
                // Set fallback user data
                setUser({
                  ...session.user,
                  role: 'parent',
                  name: session.user.email?.split('@')[0] || 'User'
                });
                setIsLoading(false);
              });
            }
          }, 50);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('🔐 AuthProvider: Exception during initialization:', error);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🔐 AuthProvider: Cleaning up');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setIsLoading, fetchUserProfile]);
};
