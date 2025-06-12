
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
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) {
      return;
    }
    
    console.log('🔐 AuthProvider: Setting up auth state listener');
    isInitializedRef.current = true;
    isMountedRef.current = true;

    const handleAuthStateChange = async (event: string, session: any) => {
      console.log('🔐 AuthProvider: Auth state changed', { 
        event, 
        hasUser: !!session?.user, 
        userEmail: session?.user?.email
      });
      
      if (!isMountedRef.current) {
        console.log('🔐 AuthProvider: Component unmounted, ignoring auth change');
        return;
      }

      try {
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('🔐 AuthProvider: User signed out or no session');
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('🔐 AuthProvider: User authenticated, fetching profile');
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('🔐 AuthProvider: Error in auth state handler:', error);
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

    // Get initial session
    const initializeAuth = async () => {
      if (!isMountedRef.current) return;
      
      try {
        console.log('🔐 AuthProvider: Getting initial session');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 AuthProvider: Session error:', error);
          if (isMountedRef.current) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (!isMountedRef.current) return;

        console.log('🔐 AuthProvider: Initial session check', { 
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
        console.error('🔐 AuthProvider: Exception during initialization:', error);
        if (isMountedRef.current) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth state listener');
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependencies to run only once
};
