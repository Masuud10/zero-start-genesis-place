
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';

// Create the auth context as before
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Safe hook for context
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Instead of throwing, return a default context object, to avoid conditional hooks in consuming components
  if (context === undefined) {
    // Instead of throw, you may fallback to an error value, but if you *must* throw, do so outside any other hook
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 1. ALL hooks at the top level
  const authState = useAuthState();
  const authActions = useAuthActions();

  // 2. Get values from hooks immediately
  const { user, isLoading, error } = authState;
  const { signIn, signUp, signOut } = authActions;

  // 3. Prepare memoized value
  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut
  }), [user, isLoading, error, signIn, signUp, signOut]);

  // 4. NEVER put hooks after any conditional or return
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
