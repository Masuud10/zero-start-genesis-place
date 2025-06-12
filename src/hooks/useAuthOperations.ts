
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';

export const useAuthOperations = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (authUser: User) => {
    console.log('👤 AuthProvider: Fetching user profile for', authUser.email);
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, school_id, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();

      console.log('👤 AuthProvider: Profile query result:', { profile, error });

      if (error && !error.message.includes('0 rows')) {
        console.error('👤 AuthProvider: Error fetching profile:', error);
      }

      const userData: AuthUser = {
        ...authUser,
        role: profile?.role || 'parent',
        name: profile?.name || authUser.email?.split('@')[0] || 'User',
        school_id: profile?.school_id,
        avatar_url: profile?.avatar_url
      };

      console.log('👤 AuthProvider: Setting user data:', userData);
      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ AuthProvider: Exception fetching user profile:', error);
      
      // Create fallback user data to prevent app from breaking
      const userData: AuthUser = {
        ...authUser,
        role: 'parent',
        name: authUser.email?.split('@')[0] || 'User'
      };
      
      console.log('👤 AuthProvider: Using fallback user data after exception');
      setUser(userData);
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('🔑 AuthProvider: Attempting sign in for', email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      console.log('🔑 AuthProvider: Sign in result', { 
        success: !!data.user, 
        error: error?.message,
        user: data.user?.email 
      });
      
      if (error) {
        console.error('🔑 AuthProvider: Sign in error:', error);
        setIsLoading(false);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ AuthProvider: Sign in exception:', error);
      setIsLoading(false);
      return { data: null, error: { message: error.message || 'Authentication failed' } };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata = {}) => {
    console.log('📝 AuthProvider: Attempting sign up for', email);
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
      
      console.log('📝 AuthProvider: Sign up result', { 
        success: !!data.user, 
        error: error?.message,
        needsConfirmation: !data.user?.email_confirmed_at
      });
      
      if (error) {
        setIsLoading(false);
        return { data: null, error };
      }
      
      if (data.user && !data.session) {
        console.log('📝 AuthProvider: Sign up successful, email confirmation required');
        setIsLoading(false);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ AuthProvider: Sign up exception:', error);
      setIsLoading(false);
      return { data: null, error: { message: error.message || 'Sign up failed' } };
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('🚪 AuthProvider: Signing out');
    setIsLoading(true);
    
    try {
      setUser(null);
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error && !error.message.includes('Auth session missing')) {
        console.error('❌ AuthProvider: Sign out error:', error);
      }
      
      console.log('✅ AuthProvider: Successfully signed out');
      setIsLoading(false);
      
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ AuthProvider: Sign out exception:', error);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    setUser,
    setIsLoading,
    fetchUserProfile,
    signIn,
    signUp,
    signOut
  };
};
