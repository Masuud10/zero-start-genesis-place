
import { useState, useEffect } from 'react';
import { CSRFTokenManager } from '@/utils/csrfTokenManager';
import { useAuthSignIn } from './auth/useAuthSignIn';
import { useAuthSignUp } from './auth/useAuthSignUp';
import { useAuthSignOut } from './auth/useAuthSignOut';

export const useSecureAuth = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const { secureSignIn, isLoading: signInLoading } = useAuthSignIn();
  const { secureSignUp, isLoading: signUpLoading } = useAuthSignUp();
  const { secureSignOut, isLoading: signOutLoading } = useAuthSignOut();

  const isLoading = signInLoading || signUpLoading || signOutLoading;

  useEffect(() => {
    // Generate CSRF token on mount
    const token = CSRFTokenManager.generateToken();
    setCsrfToken(token);
  }, []);

  return {
    secureSignIn,
    secureSignUp,
    secureSignOut,
    isLoading,
    csrfToken,
    captchaVerified,
    setCaptchaVerified
  };
};
