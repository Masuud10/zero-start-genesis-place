
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import LoginForm from '@/components/LoginForm';
import { ErrorState } from '@/components/common/LoadingStates';

// Safe school context access
const useSchoolSafely = () => {
  try {
    const { useSchool } = require('@/contexts/SchoolContext');
    return useSchool();
  } catch (error) {
    console.log('🎯 AppContent: School context not available');
    return { isLoading: false, error: null };
  }
};

const AppContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const { isLoading: schoolLoading, error: schoolError } = useSchoolSafely();

  console.log('🎯 AppContent: Rendering state:', { 
    hasUser: !!user, 
    authLoading, 
    authError,
    schoolLoading,
    schoolError,
    userRole: user?.role,
    userEmail: user?.email
  });

  // Handle authentication errors
  if (authError) {
    console.log('🎯 AppContent: Auth error detected, showing error state:', authError);
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
    console.log('🎯 AppContent: No user authenticated, showing landing page or login form');
    
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

  // Check if school data is still loading for roles that need it
  const rolesThatNeedSchoolData = ['principal', 'teacher', 'school_owner', 'finance_officer'];
  const needsSchoolData = rolesThatNeedSchoolData.includes(user.role);
  
  if (needsSchoolData && schoolLoading) {
    console.log('🎯 AppContent: School data loading for role:', user.role);
    return <LoadingScreen />;
  }

  // Handle school errors for roles that need school data
  if (needsSchoolData && schoolError) {
    console.log('🎯 AppContent: School error for role that needs school data:', user.role, schoolError);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          title="School Data Error"
          description="Failed to load your school information"
          error={schoolError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  console.log('🎯 AppContent: Rendering main layout for user with role:', user.role);
  
  return <ElimshaLayout />;
};

export default AppContent;
