
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import LoginForm from '@/components/LoginForm';
import { ErrorState } from '@/components/common/LoadingStates';

const AppContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);

  // Debug: Start of render
  console.log('🎯 AppContent: Starting render');

  let authState;
  try {
    authState = useAuth();
  } catch (err) {
    console.error('🎯 AppContent: Failed to get auth context', err);
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

  const { user, isLoading: authLoading, error: authError } = authState;

  // Debug current app auth state
  console.log('🎯 AppContent STATE:', { authLoading, authError, hasUser: !!user, userRole: user?.role, userEmail: user?.email });

  // 1. If authentication is loading, show loading screen
  if (authLoading) {
    console.log('🎯 AppContent: Still loading auth state -> Show loading screen');
    return <LoadingScreen />;
  }

  // 2. If auth error encountered, render error state (always show error, never fall through)
  if (authError) {
    console.log('🎯 AppContent: Auth error -> Show error state', authError);
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

  // 3. If no user, always show landing page (this handles first load for new visitors and logged out users)
  if (!user) {
    console.log('🎯 AppContent: No user authenticated -> Showing landing screen or login');
    if (showLogin) {
      return <LoginForm />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  // 4. Handle authenticated but missing role
  if (!user.role) {
    console.error('🎯 AppContent: User missing role:', user.email);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Account Setup Required"
          description="Your account role has not been configured. Please contact your administrator."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // 5. Main application starts here for authenticated users with a role
  console.log('🎯 AppContent: Authenticated, rendering ElimshaLayout for user with role:', user.role);

  return <ElimshaLayout />;
};

export default AppContent;

