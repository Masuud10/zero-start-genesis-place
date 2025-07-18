import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AdminUser, AdminRole } from '@/types/admin';

interface UseAdminAuthReturn {
  user: User | null;
  session: Session | null;
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isRole: (role: AdminRole | AdminRole[]) => boolean;
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchAdminUser = useCallback(async (userId: string) => {
    try {
      console.log('🔐 useAdminAuth: Fetching admin user for:', userId);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 10000)
      );

      const queryPromise = supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      const result = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as { data: AdminUser | null; error: { message: string } | null; status: number; statusText: string };
      
      const { data, error, status, statusText } = result;

      console.log('🔐 useAdminAuth: Query result:', { data, error, status, statusText });

      if (error) {
        console.error('🔐 useAdminAuth: Error fetching admin user:', error);
        
        // Check if it's the infinite recursion error
        if (error.message?.includes('infinite recursion')) {
          throw new Error('Database configuration error: RLS policies need to be fixed. Please contact your administrator.');
        }
        
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        console.warn('🔐 useAdminAuth: No admin user found for user_id:', userId);
        return null;
      }

      console.log('🔐 useAdminAuth: Admin user found:', data);
      return data as AdminUser;
    } catch (err) {
      console.error('🔐 useAdminAuth: Error in fetchAdminUser:', err);
      throw err; // Re-throw to be handled by caller
    }
  }, []);

  const logAuditEvent = useCallback(async (action: string, resource?: string, resourceId?: string) => {
    if (!adminUser) return;

    try {
      await supabase.from('admin_audit_logs').insert({
        admin_user_id: adminUser.id,
        action,
        resource,
        resource_id: resourceId,
        ip_address: null,
        user_agent: navigator.userAgent,
        success: true,
      });
    } catch (err) {
      console.error('🔐 useAdminAuth: Error logging audit event:', err);
    }
  }, [adminUser]);

  const processAuthState = useCallback(async (session: Session | null) => {
    console.log('🔐 useAdminAuth: Processing auth state:', session?.user?.email);
    
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      try {
        console.log('🔐 useAdminAuth: About to fetch admin user data...');
        // Fetch admin user data
        const adminUserData = await fetchAdminUser(session.user.id);
        console.log('🔐 useAdminAuth: Admin user data received:', adminUserData);
        
        if (adminUserData) {
          setAdminUser(adminUserData);
          setError(null);
          console.log('🔐 useAdminAuth: Admin user set successfully', {
            role: adminUserData.role,
            email: adminUserData.email,
            isActive: adminUserData.is_active
          });
        } else {
          console.warn('🔐 useAdminAuth: No admin user found - not an admin user');
          setAdminUser(null);
          setError('Access denied. You are not authorized to access the admin application. Please contact your administrator to be granted admin privileges.');
          // Don't auto sign out - let them stay on login page
        }
      } catch (err) {
        console.error('🔐 useAdminAuth: Error processing auth state:', err);
        setAdminUser(null);
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        if (errorMessage.includes('RLS policies need to be fixed')) {
          setError('System configuration error. Please contact your administrator immediately.');
        } else {
          setError(`Error loading admin user data: ${errorMessage}`);
        }
      }
    } else {
      console.log('🔐 useAdminAuth: No session, clearing admin user');
      setAdminUser(null);
      setError(null);
    }
    
    console.log('🔐 useAdminAuth: Setting loading to false');
    setIsLoading(false);
    setIsInitialized(true);
  }, [fetchAdminUser]);

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('🔐 useAdminAuth: Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔐 useAdminAuth: Processing SIGNED_IN event');
          setIsLoading(true);
          await processAuthState(session);
        } else if (event === 'SIGNED_OUT') {
          console.log('🔐 useAdminAuth: Processing SIGNED_OUT event');
          if (isMounted) {
            setSession(null);
            setUser(null);
            setAdminUser(null);
            setError(null);
            setIsLoading(false);
            setIsInitialized(true);
          }
        } else {
          console.log('🔐 useAdminAuth: Processing other auth event:', event);
          await processAuthState(session);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('🔐 useAdminAuth: Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          await processAuthState(session);
        }
      } catch (err) {
        console.error('🔐 useAdminAuth: Error getting session:', err);
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [processAuthState]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 useAdminAuth: Starting admin login for:', email);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('🔐 useAdminAuth: Auth error:', authError);
        setError(authError.message);
        setIsLoading(false);
        return { error: authError.message };
      }

      if (data.user) {
        console.log('🔐 useAdminAuth: User authenticated, checking admin status');
        // The auth state change listener will handle the rest
        return { error: null };
      }

      setIsLoading(false);
      return { error: 'Authentication failed' };
    } catch (err) {
      console.error('🔐 useAdminAuth: Sign in exception:', err);
      const errorMsg = 'An unexpected error occurred during sign in.';
      setError(errorMsg);
      setIsLoading(false);
      return { error: errorMsg };
    }
  };

  const signOut = async () => {
    try {
      if (adminUser) {
        await logAuditEvent('admin_logout');
      }
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setAdminUser(null);
      setError(null);
    } catch (err) {
      console.error('🔐 useAdminAuth: Error signing out:', err);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!adminUser) return false;
    
    // Super admin and edufam_admin have all permissions
    if (adminUser.role === 'super_admin' || adminUser.role === 'edufam_admin') return true;
    
    // Check specific permission
    return Boolean(adminUser.permissions?.[permission]);
  };

  const isRole = (role: AdminRole | AdminRole[]): boolean => {
    if (!adminUser) return false;
    
    if (Array.isArray(role)) {
      return role.includes(adminUser.role);
    }
    
    return adminUser.role === role;
  };

  return {
    user,
    session,
    adminUser,
    isLoading,
    error,
    signIn,
    signOut,
    hasPermission,
    isRole,
  };
};