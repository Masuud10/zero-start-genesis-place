import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { handleAuthError } from '@/utils/unifiedErrorHandler';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useConsolidatedAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isInitialized: false
  });

  const isMountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);

  // Fetch admin user profile with timeout and retry logic
  const fetchAdminProfile = useCallback(async (userId: string): Promise<any> => {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔐 Fetching admin profile for user ${userId} (attempt ${attempt})`);
        
        // ONLY fetch from admin_users table - this is an admin-only application
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('role, name, email, is_active, permissions')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (adminError) {
          throw adminError;
        }

        if (adminData) {
          console.log('✅ Admin user found:', adminData);
          return {
            ...adminData,
            is_admin: true,
            school_id: null // Admin users don't have school_id
          };
        }

        // If no admin user found, throw error - this application is admin-only
        throw new Error('Access denied. This application is restricted to admin users only.');

      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Admin profile fetch attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    console.error('❌ All admin profile fetch attempts failed');
    throw lastError;
  }, []);

  // Process user authentication - ADMIN ONLY
  const processUser = useCallback(async (authUser: any) => {
    if (!isMountedRef.current) return;
    
    console.log('🔐 Processing admin user:', authUser?.email);
    
    try {
      if (!authUser) {
        console.log('🔐 No auth user, clearing state');
        setState({
          user: null,
          isLoading: false,
          error: null,
          isInitialized: true
        });
        return;
      }

      if (!authUser.email) {
        console.error('🔐 User missing email');
        setState({
          user: null,
          isLoading: false,
          error: 'User account is missing email address',
          isInitialized: true
        });
        return;
      }

      // Fetch admin profile with timeout protection
      console.log('🔐 Fetching admin profile for', authUser.id);
      const profile = await fetchAdminProfile(authUser.id);
      
      if (!isMountedRef.current) return;

      // Validate admin role exists
      if (!profile?.role) {
        console.error('🔐 No valid admin role found in database');
        setState({
          user: null,
          isLoading: false,
          error: 'Your admin account is not properly configured. Please contact your administrator.',
          isInitialized: true
        });
        return;
      }

      // Validate that this is an admin user
      if (!profile.is_admin) {
        console.error('🔐 Non-admin user attempted to access admin application');
        setState({
          user: null,
          isLoading: false,
          error: 'Access denied. This application is restricted to admin users only.',
          isInitialized: true
        });
        return;
      }

      console.log('🔐 Admin user validated:', profile.role);

      const userData: AuthUser = {
        id: authUser.id,
        email: profile.email || authUser.email,
        role: profile.role,
        name: profile?.name ||
              authUser.user_metadata?.name ||
              authUser.user_metadata?.full_name ||
              authUser.email.split('@')[0] ||
              'Admin User',
        school_id: null, // Admin users don't have school_id
        avatar_url: authUser.user_metadata?.avatar_url,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at,
        user_metadata: authUser.user_metadata || {},
        app_metadata: authUser.app_metadata || {},
        mfa_enabled: false, // Admin users don't use MFA from profiles
        last_login_at: authUser.last_sign_in_at || undefined,
        last_login_ip: undefined,
      };

      console.log('🔐 Admin user data processed successfully:', {
        email: userData.email,
        role: userData.role,
        is_admin: profile.is_admin,
        hasProfile: !!profile
      });

      setState({
        user: userData,
        isLoading: false,
        error: null,
        isInitialized: true
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('🔐 Admin user processing failed:', error);
      
      handleAuthError(error, {
        action: 'process_admin_user',
        userId: authUser?.id,
        metadata: { email: authUser?.email }
      });
      
      setState({
        user: null,
        isLoading: false,
        error: 'Authentication failed: ' + (error.message || 'Unknown error'),
        isInitialized: true
      });
    }
  }, [fetchAdminProfile]);

  // Initialize authentication
  useEffect(() => {
    isMountedRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Setting up admin auth listener');
        
        // Clean up existing subscription
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }

        // Get initial session with timeout protection
        console.log('🔐 Getting initial session');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (!isMountedRef.current) return;

        if (sessionError) {
          console.error('🔐 Session error:', sessionError);
          setState(prev => ({
            ...prev,
            isLoading: false,
            isInitialized: true
          }));
          return;
        }

        // Process initial session immediately
        if (session?.user) {
          await processUser(session.user);
        } else {
          setState({
            user: null,
            isLoading: false,
            error: null,
            isInitialized: true
          });
        }

        // Set up auth listener for future changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔐 Admin auth event:', event, !!session);
            if (!isMountedRef.current) return;
            
            if (event === 'SIGNED_OUT' || !session) {
              setState({
                user: null,
                isLoading: false,
                error: null,
                isInitialized: true
              });
            } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
              await processUser(session.user);
            }
          }
        );
        subscriptionRef.current = subscription;

      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('🔐 Admin auth initialization failed:', error);
        
        handleAuthError(error, {
          action: 'initialize_admin_auth'
        });
        
        if (isMountedRef.current) {
          setState({
            user: null,
            isLoading: false,
            error: 'Authentication failed - please refresh the page',
            isInitialized: true
          });
        }
      }
    };

    initializeAuth();

    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [processUser]);

  // Sign in method - ADMIN ONLY
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting admin sign in for:', email);
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('🔐 Admin sign in failed:', error);
        handleAuthError(error, {
          action: 'admin_sign_in',
          metadata: { email }
        });
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
        
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('🔐 Admin sign in successful for:', email);
        return { success: true };
      }

      return { success: false, error: 'Sign in failed - no user returned' };
    } catch (error) {
      console.error('🔐 Admin sign in exception:', error);
      handleAuthError(error, {
        action: 'admin_sign_in',
        metadata: { email }
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sign out method
  const signOut = useCallback(async () => {
    try {
      console.log('🔐 Signing out admin user');
      await supabase.auth.signOut();
      setState({
        user: null,
        isLoading: false,
        error: null,
        isInitialized: true
      });
    } catch (error) {
      console.error('🔐 Admin sign out failed:', error);
      handleAuthError(error, {
        action: 'admin_sign_out'
      });
    }
  }, []);

  // Refresh user method
  const refreshUser = useCallback(async () => {
    try {
      console.log('🔐 Refreshing admin user data');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await processUser(user);
      }
    } catch (error) {
      console.error('🔐 Refresh admin user failed:', error);
      handleAuthError(error, {
        action: 'refresh_admin_user'
      });
    }
  }, [processUser]);

  return {
    ...state,
    signIn,
    signOut,
    refreshUser
  };
}; 