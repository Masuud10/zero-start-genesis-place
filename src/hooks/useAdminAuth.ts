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
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('🔐 useAdminAuth: Error fetching admin user:', error);
        return null;
      }

      console.log('🔐 useAdminAuth: Admin user found:', data);
      return data as AdminUser;
    } catch (err) {
      console.error('🔐 useAdminAuth: Error in fetchAdminUser:', err);
      return null;
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
      // Fetch admin user data
      const adminUserData = await fetchAdminUser(session.user.id);
      if (adminUserData) {
        setAdminUser(adminUserData);
        setError(null);
      } else {
        setAdminUser(null);
        setError('Access denied. You are not authorized to access the admin application.');
        // Sign out unauthorized users
        await supabase.auth.signOut();
      }
    } else {
      setAdminUser(null);
      setError(null);
    }
    
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
          await processAuthState(session);
          
          // Log login event
          const adminUserData = await fetchAdminUser(session.user.id);
          if (adminUserData) {
            setTimeout(() => {
              logAuditEvent('admin_login');
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setSession(null);
            setUser(null);
            setAdminUser(null);
            setError(null);
            setIsLoading(false);
            setIsInitialized(true);
          }
        } else {
          await processAuthState(session);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
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
  }, [processAuthState, fetchAdminUser, logAuditEvent]);

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
        return { error: authError.message };
      }

      if (data.user) {
        console.log('🔐 useAdminAuth: User authenticated, checking admin status');
        // The auth state change listener will handle the rest
        return { error: null };
      }

      return { error: 'Authentication failed' };
    } catch (err) {
      console.error('🔐 useAdminAuth: Sign in exception:', err);
      const errorMsg = 'An unexpected error occurred during sign in.';
      setError(errorMsg);
      return { error: errorMsg };
    } finally {
      setIsLoading(false);
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
    
    // Super admin has all permissions
    if (adminUser.role === 'super_admin') return true;
    
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