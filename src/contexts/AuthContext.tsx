
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser extends User {
  role?: string;
  name?: string;
  school_id?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing authentication');
    
    let isMounted = true;

    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthProvider: Auth state changed', { event, user: session?.user?.email });
      
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        console.log('🔐 AuthProvider: User signed out or no session');
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('🔐 AuthProvider: User signed in or token refreshed');
        // Defer profile fetching to avoid blocking
        setTimeout(() => {
          if (isMounted && session?.user) {
            fetchUserProfile(session.user);
          }
        }, 0);
      }
    });

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔐 AuthProvider: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 AuthProvider: Error getting session:', error);
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        console.log('🔐 AuthProvider: Initial session check', { hasSession: !!session });
        
        if (!isMounted) return;

        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('🔐 AuthProvider: Exception getting initial session:', error);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      console.log('🔐 AuthProvider: Cleaning up');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    console.log('👤 AuthProvider: Fetching user profile for', authUser.email);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('👤 AuthProvider: Error fetching profile:', error);
      }

      console.log('👤 AuthProvider: Profile query result:', { profile, error });

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
      // Even if profile fetch fails, set user with basic info
      const userData: AuthUser = {
        ...authUser,
        role: 'parent',
        name: authUser.email?.split('@')[0] || 'User'
      };
      setUser(userData);
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 AuthProvider: Attempting sign in for', email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('🔑 AuthProvider: Sign in result', { 
        success: !!data.user, 
        error: error?.message,
        user: data.user?.email 
      });
      
      // Don't set loading to false here - let onAuthStateChange handle it
      return { data, error };
    } catch (error) {
      console.error('❌ AuthProvider: Sign in exception:', error);
      setIsLoading(false);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    console.log('📝 AuthProvider: Attempting sign up for', email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      console.log('📝 AuthProvider: Sign up result', { 
        success: !!data.user, 
        error: error?.message 
      });
      
      // Don't set loading to false here - let onAuthStateChange handle it
      return { data, error };
    } catch (error) {
      console.error('❌ AuthProvider: Sign up exception:', error);
      setIsLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('🚪 AuthProvider: Signing out');
    setIsLoading(true);
    
    try {
      // Clear user state immediately
      setUser(null);
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Don't throw error if session is already missing - this is expected in some cases
      if (error && !error.message.includes('Auth session missing')) {
        console.error('❌ AuthProvider: Sign out error:', error);
        throw error;
      }
      
      console.log('✅ AuthProvider: Successfully signed out');
      
      // Clear any local storage items related to auth
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (storageError) {
        console.warn('⚠️ AuthProvider: Could not clear localStorage:', storageError);
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('❌ AuthProvider: Sign out exception:', error);
      // Even if sign out fails, clear local state
      setUser(null);
      setIsLoading(false);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut
  };

  console.log('🔐 AuthProvider: Rendering with state', { 
    hasUser: !!user, 
    isLoading, 
    userEmail: user?.email,
    userRole: user?.role,
    userSchoolId: user?.school_id
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
