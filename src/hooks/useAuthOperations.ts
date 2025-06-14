
import { useState, useCallback } from 'react';
import { AuthUser } from '@/types/auth';
import { useUserProfile } from './useUserProfile';
import { useAuthActions } from './useAuthActions';

export const useAuthOperations = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { fetchUserProfile, cleanup: profileCleanup } = useUserProfile();
  const { signIn: authSignIn, signUp: authSignUp, signOut: authSignOut, cleanup: actionsCleanup } = useAuthActions();

  const wrappedFetchUserProfile = useCallback(async (authUser: any) => {
    await fetchUserProfile(authUser, setUser, setIsLoading);
  }, [fetchUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    return await authSignIn(email, password, setIsLoading);
  }, [authSignIn]);

  const signUp = useCallback(async (email: string, password: string, metadata = {}) => {
    return await authSignUp(email, password, metadata, setIsLoading);
  }, [authSignUp]);

  const signOut = useCallback(async () => {
    await authSignOut(setUser, setIsLoading);
  }, [authSignOut]);

  const cleanup = useCallback(() => {
    console.log('🧹 AuthOperations: Cleaning up');
    profileCleanup();
    actionsCleanup();
  }, [profileCleanup, actionsCleanup]);

  return {
    user,
    isLoading,
    setUser,
    setIsLoading,
    fetchUserProfile: wrappedFetchUserProfile,
    signIn,
    signUp,
    signOut,
    cleanup
  };
};
