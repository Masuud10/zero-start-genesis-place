
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import LoginForm from '@/components/LoginForm';
import { ErrorState } from '@/components/common/LoadingStates';
import { NavigationProvider } from '@/contexts/NavigationContext';

const AppContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [forceError, setForceError] = useState(false);

  console.log('🎯 AppContent: Render start');

  // Always try to get auth state safely
  let authState;
  try {
    authState = useAuth();
  } catch (err) {
    console.error('🎯 AppContent: Auth context error', err);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Authentication Error"
          description="Failed to initialize authentication system"
          error={String(err)}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Defensive check for auth state
  if (!authState || typeof authState !== "object") {
    console.error('🎯 AppContent: Invalid auth state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="System Error"
          description="Failed to retrieve authentication information."
          error="No auth context"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const { user, isLoading: authLoading, error: authError } = authState;
  console.log('🎯 AppContent: State:', { 
    authLoading, 
    authError, 
    hasUser: !!user, 
    role: user?.role, 
    email: user?.email 
  });

  // Force error state if loading takes too long
  useEffect(() => {
    if (authLoading && !forceError) {
      const timeout = setTimeout(() => {
        console.error('🎯 AppContent: Auth loading timeout after 20 seconds');
        setForceError(true);
      }, 20000);

      return () => clearTimeout(timeout);
    }
  }, [authLoading, forceError]);

  // Loading state with timeout protection
  if (authLoading && !forceError) {
    console.log('🎯 AppContent: Loading auth...');
    return <LoadingScreen />;
  }

  // Force error or actual error state
  if (authError || forceError) {
    console.log('🎯 AppContent: Auth error or timeout:', authError);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Authentication Error"
          description={forceError ? "Authentication is taking too long" : "There was a problem with your authentication"}
          error={forceError ? "Authentication timeout" : authError}
          onRetry={() => {
            setForceError(false);
            window.location.reload();
          }}
        />
      </div>
    );
  }

  // No user authenticated
  if (!user) {
    console.log('🎯 AppContent: No user - LandingPage or LoginForm');
    if (showLogin) return <LoginForm />;
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  // User authenticated but missing role
  if (!user.role) {
    console.error('🎯 AppContent: User missing role', user.email);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Account Setup Required"
          description="Your account role has not been configured. Please contact your administrator."
          error={`User: ${user.email}. Missing role information.`}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Authenticated user with role => show main app
  console.log('🎯 AppContent: Authenticated. Render ElimshaLayout.', { role: user.role });
  return (
    <NavigationProvider>
      <ElimshaLayout />
    </NavigationProvider>
  );
};

export default AppContent;
