
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import LoginForm from '@/components/LoginForm';
import { ErrorState } from '@/components/common/LoadingStates';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { SchoolProvider } from '@/contexts/SchoolContext';

const AppContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);

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
    email: user?.email,
    initializationComplete
  });

  // Set initialization complete after a brief delay to prevent immediate timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitializationComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading only for a reasonable time
  if (authLoading && initializationComplete) {
    console.log('🎯 AppContent: Loading auth...');
    return <LoadingScreen />;
  }

  // Handle auth errors
  if (authError) {
    console.log('🎯 AppContent: Auth error:', authError);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Authentication Error"
          description="There was a problem with your authentication"
          error={authError}
          onRetry={() => window.location.reload()}
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
    <SchoolProvider>
      <NavigationProvider>
        <ElimshaLayout />
      </NavigationProvider>
    </SchoolProvider>
  );
};

export default AppContent;
