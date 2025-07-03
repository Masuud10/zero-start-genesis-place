import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import LoginForm from '@/components/LoginForm';
import DeactivatedAccountMessage from '@/components/auth/DeactivatedAccountMessage';
import { ErrorState } from '@/components/common/LoadingStates';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { SchoolProvider } from '@/contexts/SchoolContext';
import MaintenanceCheck from '@/components/maintenance/MaintenanceCheck';

const AppContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);

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

  const { user, isLoading: authLoading, error: authError, isInitialized } = authState;
  console.log('🎯 AppContent: State:', { 
    authLoading, 
    authError, 
    hasUser: !!user, 
    role: user?.role, 
    email: user?.email,
    isInitialized
  });

  // Show loading only if not initialized yet
  if (!isInitialized && authLoading) {
    console.log('🎯 AppContent: Loading auth...');
    return <LoadingScreen />;
  }

  // Handle auth errors
  if (authError) {
    console.log('🎯 AppContent: Auth error:', authError);
    
    // Check if the error is related to account deactivation
    if (authError.includes('deactivated') || authError.includes('inactive')) {
      return <DeactivatedAccountMessage />;
    }
    
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

  // No user authenticated - show login/landing based on URL or state
  if (!user) {
    console.log('🎯 AppContent: No user - checking URL path');
    
    // Check current path to determine what to show
    const currentPath = window.location.pathname;
    
    // If user is on login path or has requested login, show login form
    if (currentPath === '/login' || showLogin) {
      return <LoginForm />;
    }
    
    // Otherwise show landing page
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  // Check if user account is deactivated
  if (user && user.user_metadata?.status === 'inactive') {
    console.log('🎯 AppContent: User account is deactivated');
    return <DeactivatedAccountMessage />;
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
    <MaintenanceCheck>
      <SchoolProvider>
        <NavigationProvider>
          <ElimshaLayout />
        </NavigationProvider>
      </SchoolProvider>
    </MaintenanceCheck>
  );
};

export default AppContent;
