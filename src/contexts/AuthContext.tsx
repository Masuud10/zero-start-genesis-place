
import React, { createContext, useContext, ReactNode } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthState();
  const authActions = useAuthActions();

  const { user, isLoading, error } = authState;
  const { signIn, signUp, signOut } = authActions;

  console.log('🔐 AuthProvider: Rendering with state', { 
    hasUser: !!user, 
    isLoading, 
    error: error ? 'Error present' : 'No error',
    userEmail: user?.email,
    userRole: user?.role,
    userSchoolId: user?.school_id
  });

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
