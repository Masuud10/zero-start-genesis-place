
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAuthStateListenerProps {
  setUser: (user: any) => void;
  setIsLoading: (loading: boolean) => void;
  fetchUserProfile: (user: any) => Promise<void>;
}

// Helper function to determine user role consistently
const determineUserRole = (user: any): string => {
  console.log('🔐 AuthStateListener: Determining role for user:', user?.email, 'metadata:', user?.user_metadata, 'app_metadata:', user?.app_metadata);

  // Priority 1: Use role from user_metadata if available
  const metadataRole = user?.user_metadata?.role;
  if (metadataRole && metadataRole !== 'parent') {
    console.log('🔐 AuthStateListener: Using user_metadata role:', metadataRole);
    return metadataRole;
  }

  // Priority 2: Use role from app_metadata if available
  const appMetadataRole = user?.app_metadata?.role;
  if (appMetadataRole && appMetadataRole !== 'parent') {
    console.log('🔐 AuthStateListener: Using app_metadata role:', appMetadataRole);
    return appMetadataRole;
  }

  // Priority 3: Determine from email patterns (only if no other role found)
  const email = user?.email?.toLowerCase() || '';
  
  if (email.includes('@elimisha') || email === 'masuud@gmail.com') {
    console.log('🔐 AuthStateListener: Assigning elimisha_admin role based on email pattern');
    return 'elimisha_admin';
  }
  
  if (email.includes('admin') && !email.includes('parent')) {
    console.log('🔐 AuthStateListener: Assigning edufam_admin role based on email pattern');
    return 'edufam_admin';
  }
  
  if (email.includes('principal') && !email.includes('parent')) {
    console.log('🔐 AuthStateListener: Assigning principal role based on email pattern');
    return 'principal';
  }
  
  if (email.includes('teacher') && !email.includes('parent')) {
    console.log('🔐 AuthStateListener: Assigning teacher role based on email pattern');
    return 'teacher';
  }
  
  if (email.includes('owner') && !email.includes('parent')) {
    console.log('🔐 AuthStateListener: Assigning school_owner role based on email pattern');
    return 'school_owner';
  }
  
  if (email.includes('finance') && !email.includes('parent')) {
    console.log('🔐 AuthStateListener: Assigning finance_officer role based on email pattern');
    return 'finance_officer';
  }

  // Default to parent only if no other role could be determined
  console.log('🔐 AuthStateListener: Defaulting to parent role for:', email);
  return 'parent';
};

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
        userEmail: session?.user?.email,
        userRole: session?.user?.user_metadata?.role || session?.user?.app_metadata?.role
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
          console.log('🔐 AuthStateListener: User authenticated, fetching profile for user:', session.user.email);
          
          // Fetch profile with better error handling
          try {
            await fetchUserProfile(session.user);
          } catch (profileError) {
            console.error('🔐 AuthStateListener: Profile fetch failed:', profileError);
            
            // Create enhanced fallback user with improved role determination
            const fallbackRole = determineUserRole(session.user);
            
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              role: fallbackRole,
              school_id: session.user.user_metadata?.school_id || session.user.app_metadata?.school_id || null,
              // Include other auth properties that might be useful
              aud: session.user.aud,
              confirmed_at: session.user.confirmed_at,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at,
              last_sign_in_at: session.user.last_sign_in_at,
              app_metadata: session.user.app_metadata,
              user_metadata: session.user.user_metadata,
              identities: session.user.identities,
              is_anonymous: session.user.is_anonymous || false
            };
            
            console.log('🔐 AuthStateListener: Using enhanced fallback user data with role:', fallbackRole, 'user:', fallbackUser);
            setUser(fallbackUser);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('🔐 AuthStateListener: Error in auth state handler:', error);
        // Set fallback user data to prevent app from breaking
        if (session?.user && isMountedRef.current) {
          const fallbackRole = determineUserRole(session.user);
          
          const fallbackUser = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            role: fallbackRole,
            school_id: session.user.user_metadata?.school_id || session.user.app_metadata?.school_id || null,
            aud: session.user.aud,
            confirmed_at: session.user.confirmed_at,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at,
            last_sign_in_at: session.user.last_sign_in_at,
            app_metadata: session.user.app_metadata,
            user_metadata: session.user.user_metadata,
            identities: session.user.identities,
            is_anonymous: session.user.is_anonymous || false
          };
          
          console.log('🔐 AuthStateListener: Using enhanced fallback after error with role:', fallbackRole);
          setUser(fallbackUser);
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
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          userRole: session?.user?.user_metadata?.role || session?.user?.app_metadata?.role
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
