
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import LoginForm from '@/components/LoginForm';

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
    console.log('🎯 AppContent: Auth error detected, showing login form:', authError);
    return <LoginForm />;
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
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Setup Required</h2>
          <p className="text-gray-600 mb-4">
            Your account role has not been configured. Please contact your administrator.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
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
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">School Data Error</h2>
          <p className="text-gray-600 mb-4">
            {schoolError}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  console.log('🎯 AppContent: Rendering main layout for user with role:', user.role);
  
  return <ElimshaLayout />;
};

export default AppContent;
