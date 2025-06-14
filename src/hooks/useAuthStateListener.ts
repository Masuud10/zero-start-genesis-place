
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
  const initializingRef = useRef(false);

  useEffect(() => {
    // Always update the mounted status
    isMountedRef.current = true;

    // Prevent multiple initializations
    if (initializingRef.current) {
      console.log('🔐 AuthStateListener: Already initializing, skipping');
      return;
    }

    // Prevent multiple subscriptions
    if (subscriptionRef.current) {
      console.log('🔐 AuthStateListener: Subscription already exists, skipping setup');
      return;
    }
    
    initializingRef.current = true;
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
          // Fetch profile with better error handling
          try {
            await fetchUserProfile(session.user);
          } catch (profileError) {
            console.error('🔐 AuthStateListener: Profile fetch failed:', profileError);
            // Set basic user data if profile fetch fails
            setUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.email?.split('@')[0] || 'User',
              role: 'parent', // Default role
              school_id: null
            });
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('🔐 AuthStateListener: Error in auth state handler:', error);
        // Set fallback user data to prevent app from breaking
        if (session?.user && isMountedRef.current) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.email?.split('@')[0] || 'User',
            role: 'parent',
            school_id: null
          });
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    subscriptionRef.current = subscription;

    // Get initial session with timeout
    const initializeAuth = async () => {
      if (!isMountedRef.current) return;
      
      try {
        console.log('🔐 AuthStateListener: Getting initial session');
        
        // Add timeout to prevent infinite loading
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
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
      } finally {
        initializingRef.current = false;
      }
    };

    // Add a fallback timeout to ensure loading state is always resolved
    const fallbackTimeout = setTimeout(() => {
      if (isMountedRef.current && initializingRef.current) {
        console.warn('🔐 AuthStateListener: Fallback timeout - forcing loading to false');
        setIsLoading(false);
        initializingRef.current = false;
      }
    }, 15000); // 15 second fallback

    initializeAuth();

    return () => {
      console.log('🔐 AuthStateListener: Cleaning up auth state listener');
      isMountedRef.current = false;
      initializingRef.current = false;
      clearTimeout(fallbackTimeout);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []); // Empty dependency array to prevent re-initialization
};
