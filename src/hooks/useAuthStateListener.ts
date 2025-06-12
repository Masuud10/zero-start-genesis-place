
import { useEffect, useRef } from 'react';
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
  const isMountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Always update the mounted status
    isMountedRef.current = true;

    // Prevent multiple subscriptions
    if (subscriptionRef.current) {
      console.log('🔐 AuthStateListener: Subscription already exists, skipping setup');
      return;
    }
    
    console.log('🔐 AuthStateListener: Setting up auth state listener');

    const handleAuthStateChange = async (event: string, session: any) => {
      console.log('🔐 AuthStateListener: Auth state changed', { 
        event, 
        hasUser: !!session?.user, 
        userEmail: session?.user?.email
      });
      
      if (!isMountedRef.current) {
        console.log('🔐 AuthStateListener: Component unmounted, ignoring auth change');
        return;
      }

      try {
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('🔐 AuthStateListener: User signed out or no session');
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('🔐 AuthStateListener: User authenticated, fetching profile');
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('🔐 AuthStateListener: Error in auth state handler:', error);
        // Set fallback user data to prevent app from breaking
        if (session?.user && isMountedRef.current) {
          setUser({
            ...session.user,
            role: 'parent',
            name: session.user.email?.split('@')[0] || 'User'
          });
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    subscriptionRef.current = subscription;

    // Get initial session
    const initializeAuth = async () => {
      if (!isMountedRef.current) return;
      
      try {
        console.log('🔐 AuthStateListener: Getting initial session');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 AuthStateListener: Session error:', error);
          if (isMountedRef.current) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (!isMountedRef.current) return;

        console.log('🔐 AuthStateListener: Initial session check', { 
          hasSession: !!session,
          hasUser: !!session?.user 
        });
        
        if (session?.user) {
          await handleAuthStateChange('INITIAL_SESSION', session);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('🔐 AuthStateListener: Exception during initialization:', error);
        if (isMountedRef.current) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🔐 AuthStateListener: Cleaning up auth state listener');
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [setUser, setIsLoading, fetchUserProfile]); // Keep dependencies stable
};
