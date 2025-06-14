
import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
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
  const mountedRef = useRef(true);
  
  const {
    user,
    isLoading,
    setUser,
    setIsLoading,
    fetchUserProfile,
    signIn,
    signUp,
    signOut,
    cleanup
  } = useAuthOperations();

  // Use the auth state listener with stable dependencies
  const { cleanup: listenerCleanup } = useAuthStateListener({
    setUser,
    setIsLoading,
    fetchUserProfile
  });

  // Cleanup on unmount with proper timing
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      console.log('🔐 AuthProvider: Starting cleanup');
      mountedRef.current = false;
      
      // Use a timeout to prevent immediate cleanup that could cause hooks errors
      setTimeout(() => {
        if (listenerCleanup) {
          listenerCleanup();
        }
        cleanup();
      }, 100);
    };
  }, [cleanup, listenerCleanup]);

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
    userSchoolId: user?.school_id,
    mounted: mountedRef.current
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
