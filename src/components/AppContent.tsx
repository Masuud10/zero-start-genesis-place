
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import LoginForm from '@/components/LoginForm';
import { ErrorState } from '@/components/common/LoadingStates';

const AppContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  
  console.log('🎯 AppContent: Starting render');
  
  // Get auth state - this should not throw if AuthProvider is properly set up
  let authState;
  try {
    authState = useAuth();
  } catch (error) {
    console.error('🎯 AppContent: Failed to get auth context:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="Authentication Error"
          description="Failed to initialize authentication system"
          error="Authentication context not available"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const { user, isLoading: authLoading, error: authError } = authState;

  console.log('🎯 AppContent: Auth state:', { 
    hasUser: !!user, 
    authLoading, 
    authError,
    userRole: user?.role,
    userEmail: user?.email
  });

  // Handle critical authentication errors
  if (authError && authError.includes('processing failed')) {
    console.log('🎯 AppContent: Critical auth error detected:', authError);
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

  // Show loading screen while auth is loading (but not indefinitely)
  if (authLoading) {
    console.log('🎯 AppContent: Auth loading, showing loading screen');
    return <LoadingScreen />;
  }

  // If no user is authenticated
  if (!user) {
    console.log('🎯 AppContent: No user authenticated, showing landing or login');
    
    if (showLogin) {
      return <LoginForm />;
    }
    
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  // Validate user has a role
  if (!user.role) {
    console.error('🎯 AppContent: User has no role:', user.email);
    
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

  console.log('🎯 AppContent: Rendering main layout for user with role:', user.role);
  
  return <ElimshaLayout />;
};

export default AppContent;
