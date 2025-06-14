
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import LoginForm from '@/components/LoginForm';
import { ErrorState } from '@/components/common/LoadingStates';

const AppContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  
  const { user, isLoading: authLoading, error: authError } = useAuth();

  console.log('🎯 AppContent: Rendering state:', { 
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

  // Show loading screen while actively loading
  if (authLoading) {
    console.log('🎯 AppContent: Auth loading, showing loading screen');
    return <LoadingScreen />;
  }

  // If no user, show landing page or login
  if (!user) {
    console.log('🎯 AppContent: No user authenticated');
    
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
