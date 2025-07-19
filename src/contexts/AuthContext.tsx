import React, { createContext, useContext, ReactNode } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthActions } from "@/hooks/useAuthActions";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthState();
  const authActions = useAuthActions();

  const value: AuthContextType = {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    isInitialized: authState.isInitialized,
    signIn: authActions.signIn,
    signOut: authActions.signOut,
  };

  console.log("🔐 AuthProvider: State update", {
    hasUser: !!value.user,
    isLoading: value.isLoading,
    hasError: !!value.error,
    userRole: value.user?.role,
    userEmail: value.user?.email,
    isInitialized: value.isInitialized,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
