import { useState, useEffect } from 'react';
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

  const fetchAdminUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching admin user:', error);
        return null;
      }

      return data as AdminUser;
    } catch (err) {
      console.error('Error in fetchAdminUser:', err);
      return null;
    }
  };

  const logAuditEvent = async (action: string, resource?: string, resourceId?: string) => {
    if (!adminUser) return;

    try {
      await supabase.from('admin_audit_logs').insert({
        admin_user_id: adminUser.id,
        action,
        resource,
        resource_id: resourceId,
        ip_address: null, // Could be enhanced to get real IP
        user_agent: navigator.userAgent,
        success: true,
      });
    } catch (err) {
      console.error('Error logging audit event:', err);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Admin auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch admin user data
          const adminUserData = await fetchAdminUser(session.user.id);
          if (adminUserData) {
            setAdminUser(adminUserData);
            setError(null);
            
            // Log login event
            if (event === 'SIGNED_IN') {
              setTimeout(() => {
                logAuditEvent('admin_login');
              }, 0);
            }
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
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const adminUserData = await fetchAdminUser(session.user.id);
        if (adminUserData) {
          setAdminUser(adminUserData);
          setError(null);
        } else {
          setAdminUser(null);
          setError('Access denied. You are not authorized to access the admin application.');
          await supabase.auth.signOut();
        }
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return { error: authError.message };
      }

      if (data.user) {
        // Check if user is an admin
        const adminUserData = await fetchAdminUser(data.user.id);
        if (!adminUserData) {
          await supabase.auth.signOut();
          const errorMsg = 'Access denied. Only authorized admin users can access this application.';
          setError(errorMsg);
          return { error: errorMsg };
        }
      }

      return { error: null };
    } catch (err) {
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
      console.error('Error signing out:', err);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!adminUser) return false;
    
    // Super admin has all permissions
    if (adminUser.role === 'super_admin') return true;
    
    // Check specific permission
    return Boolean(adminUser.permissions[permission]);
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