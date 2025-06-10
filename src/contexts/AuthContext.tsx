
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing authentication');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔐 AuthProvider: Initial session check', { session: !!session, error });
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthProvider: Auth state changed', { event, user: session?.user?.email });
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    console.log('👤 AuthProvider: Fetching user profile for', authUser.email);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.warn('⚠️ AuthProvider: Profile fetch error (user may not have profile yet):', error);
      }

      console.log('👤 AuthProvider: Profile data:', profile);

      setUser({
        ...authUser,
        role: profile?.role || 'parent',
        name: profile?.name || authUser.email,
        school_id: profile?.school_id,
        avatar_url: profile?.avatar_url
      });
    } catch (error) {
      console.error('❌ AuthProvider: Error fetching user profile:', error);
      setUser(authUser as AuthUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 AuthProvider: Attempting sign in for', email);
    
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
      
      if (error) {
        console.error('❌ AuthProvider: Sign in error:', error);
        return { error };
      }
      
      return { data };
    } catch (error) {
      console.error('❌ AuthProvider: Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    console.log('📝 AuthProvider: Attempting sign up for', email);
    
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
    
    return { data, error };
  };

  const signOut = async () => {
    console.log('🚪 AuthProvider: Signing out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ AuthProvider: Sign out error:', error);
      throw error;
    }
    console.log('✅ AuthProvider: Successfully signed out');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
