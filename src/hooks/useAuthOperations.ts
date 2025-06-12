
import { useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';

export const useAuthOperations = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  const fetchUserProfile = useCallback(async (authUser: User) => {
    if (!isMountedRef.current) return;
    
    console.log('👤 AuthOperations: Fetching user profile for', authUser.email);
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, school_id, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!isMountedRef.current) return;

      console.log('👤 AuthOperations: Profile query result:', { profile, error });

      if (error && !error.message.includes('0 rows')) {
        console.error('👤 AuthOperations: Error fetching profile:', error);
      }

      const userData: AuthUser = {
        ...authUser,
        role: profile?.role || 'parent',
        name: profile?.name || authUser.email?.split('@')[0] || 'User',
        school_id: profile?.school_id,
        avatar_url: profile?.avatar_url
      };

      console.log('👤 AuthOperations: Setting user data:', userData);
      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ AuthOperations: Exception fetching user profile:', error);
      
      if (!isMountedRef.current) return;
      
      // Create fallback user data to prevent app from breaking
      const userData: AuthUser = {
        ...authUser,
        role: 'parent',
        name: authUser.email?.split('@')[0] || 'User'
      };
      
      console.log('👤 AuthOperations: Using fallback user data after exception');
      setUser(userData);
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isMountedRef.current) return { data: null, error: { message: 'Component unmounted' } };
    
    console.log('🔑 AuthOperations: Attempting sign in for', email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      console.log('🔑 AuthOperations: Sign in result', { 
        success: !!data.user, 
        error: error?.message,
        user: data.user?.email 
      });
      
      if (error) {
        console.error('🔑 AuthOperations: Sign in error:', error);
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ AuthOperations: Sign in exception:', error);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return { data: null, error: { message: error.message || 'Authentication failed' } };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata = {}) => {
    if (!isMountedRef.current) return { data: null, error: { message: 'Component unmounted' } };
    
    console.log('📝 AuthOperations: Attempting sign up for', email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: email.split('@')[0],
            ...metadata
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      console.log('📝 AuthOperations: Sign up result', { 
        success: !!data.user, 
        error: error?.message,
        needsConfirmation: !data.user?.email_confirmed_at
      });
      
      if (error) {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        return { data: null, error };
      }
      
      if (data.user && !data.session) {
        console.log('📝 AuthOperations: Sign up successful, email confirmation required');
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ AuthOperations: Sign up exception:', error);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return { data: null, error: { message: error.message || 'Sign up failed' } };
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('🚪 AuthOperations: Signing out');
    setIsLoading(true);
    
    try {
      setUser(null);
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error && !error.message.includes('Auth session missing')) {
        console.error('❌ AuthOperations: Sign out error:', error);
      }
      
      console.log('✅ AuthOperations: Successfully signed out');
      setIsLoading(false);
      
      // Force page reload to ensure clean state
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ AuthOperations: Sign out exception:', error);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  return {
    user,
    isLoading,
    setUser,
    setIsLoading,
    fetchUserProfile,
    signIn,
    signUp,
    signOut,
    cleanup
  };
};
