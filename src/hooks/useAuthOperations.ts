
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';

export const useAuthOperations = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (authUser: User) => {
    console.log('👤 AuthProvider: Fetching user profile for', authUser.email);
    
    try {
      // Use a more defensive approach to avoid RLS recursion issues
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, school_id, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();

      console.log('👤 AuthProvider: Profile query result:', { profile, error });

      if (error) {
        console.error('👤 AuthProvider: Error fetching profile:', error);
        
        // If we get a server error or RLS error, fall back to basic user data
        if (error.code === 'PGRST301' || error.message.includes('recursion') || error.message.includes('500')) {
          console.log('👤 AuthProvider: Using fallback user data due to server error');
          const userData: AuthUser = {
            ...authUser,
            role: 'parent', // Safe default
            name: authUser.email?.split('@')[0] || 'User'
          };
          setUser(userData);
          setIsLoading(false);
          return;
        }
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
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 AuthProvider: Attempting sign in for', email);
    setIsLoading(true);
    
    try {
      // First, clear any existing session
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

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
      
      if (data.user) {
        console.log('🔑 AuthProvider: Sign in successful, user authenticated');
        // Don't set loading to false here - let the auth state change handle it
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ AuthProvider: Sign in exception:', error);
      setIsLoading(false);
      return { data: null, error: { message: error.message || 'Authentication failed' } };
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    console.log('📝 AuthProvider: Attempting sign up for', email);
    setIsLoading(true);
    
    try {
      // Clear any existing session first
      await supabase.auth.signOut({ scope: 'global' });
      
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
      
      // For sign up, we might not get an immediate session if email confirmation is required
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
  };

  const signOut = async () => {
    console.log('🚪 AuthProvider: Signing out');
    setIsLoading(true);
    
    try {
      // Clear user state immediately
      setUser(null);
      
      // Clear local storage items related to auth
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (storageError) {
        console.warn('⚠️ AuthProvider: Could not clear localStorage:', storageError);
      }
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error && !error.message.includes('Auth session missing')) {
        console.error('❌ AuthProvider: Sign out error:', error);
      }
      
      console.log('✅ AuthProvider: Successfully signed out');
      setIsLoading(false);
      
      // Force a page reload to ensure clean state
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ AuthProvider: Sign out exception:', error);
      // Even if sign out fails, clear local state
      setUser(null);
      setIsLoading(false);
    }
  };

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
