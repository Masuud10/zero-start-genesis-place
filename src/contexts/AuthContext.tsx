
import React, { createContext, useContext, ReactNode } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { useAuthStateListener } from '@/hooks/useAuthStateListener';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    isLoading,
    setUser,
    setIsLoading,
    fetchUserProfile,
    signIn,
    signUp,
    signOut
  } = useAuthOperations();

  useAuthStateListener({
    setUser,
    setIsLoading,
    fetchUserProfile
  });

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
