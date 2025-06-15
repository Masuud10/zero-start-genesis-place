
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import LoginForm from '@/components/LoginForm';
import { ErrorState } from '@/components/common/LoadingStates';

const AppContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);

  console.log('🎯 AppContent: Render start');

  // Step 1: Always try to get auth state safely
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

  // Defensive: in case useAuth returns null or malformatted value
  if (!authState || typeof authState !== "object") {
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
  console.log('🎯 AppContent: State:', { authLoading, authError, user, role: user?.role, email: user?.email });

  // Step 2: Loading
  if (authLoading) {
    console.log('🎯 AppContent: Loading auth...');
    return <LoadingScreen />;
  }

  // Step 3: Error in auth
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

  // Step 4: No user authenticated
  if (!user) {
    console.log('🎯 AppContent: No user - LandingPage or LoginForm');
    if (showLogin) return <LoginForm />;
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  // Step 5: User is authenticated but missing role
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

  // Step 6: Authenticated user with role => show main app
  console.log('🎯 AppContent: Authenticated. Render ElimshaLayout.', { role: user.role });
  return <ElimshaLayout />;
};

export default AppContent;
