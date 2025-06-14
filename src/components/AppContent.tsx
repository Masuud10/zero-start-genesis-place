
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import LoginForm from '@/components/LoginForm';

const AppContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isStable, setIsStable] = useState(false);

  // Safe auth context access with error handling
  let user: any = null;
  let authLoading = true;
  let schoolLoading = false;
  let authError = false;

  try {
    const authContext = useAuth();
    user = authContext.user;
    authLoading = authContext.isLoading;
  } catch (error) {
    console.error('🎯 AppContent: Auth context error:', error);
    authError = true;
    authLoading = false;
  }

  try {
    const schoolContext = useSchool();
    schoolLoading = schoolContext.isLoading;
  } catch (error) {
    console.error('🎯 AppContent: School context error:', error);
    schoolLoading = false;
  }

  // Enhanced stability check with error handling
  useEffect(() => {
    if (authError) {
      console.log('🎯 AppContent: Auth error detected, setting stable');
      setIsStable(true);
      return;
    }

    if (!authLoading) {
      const timer = setTimeout(() => {
        setIsStable(true);
      }, 300); // Reduced timeout for better responsiveness
      
      return () => clearTimeout(timer);
    } else {
      setIsStable(false);
    }
  }, [authLoading, authError]);

  console.log('🎯 AppContent: Rendering', { 
    hasUser: !!user, 
    authLoading, 
    authError,
    schoolLoading,
    isStable,
    userRole: user?.role,
    userSchoolId: user?.school_id,
    showLogin
  });

  // Handle auth errors by showing login
  if (authError) {
    console.log('🎯 AppContent: Auth error, showing login form');
    return <LoginForm />;
  }

  // Show loading screen while authentication is initializing or stabilizing
  if (authLoading || !isStable) {
    console.log('🎯 AppContent: Auth loading or stabilizing, showing loading screen');
    return <LoadingScreen />;
  }

  // If no user, show landing page or login
  if (!user) {
    console.log('🎯 AppContent: No user, showing landing page or login form');
    
    if (showLogin) {
      return <LoginForm />;
    }
    
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  // Enhanced role validation before proceeding
  if (!user.role) {
    console.log('🎯 AppContent: User has no role, showing error');
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

  // For authenticated users, show loading only for school data if needed
  // Skip school loading for system admins and parents as they don't need school context initially
  const shouldShowSchoolLoading = schoolLoading && 
    user.role !== 'parent' && 
    user.role !== 'elimisha_admin' && 
    user.role !== 'edufam_admin';
  
  if (shouldShowSchoolLoading) {
    console.log('🎯 AppContent: User authenticated but schools loading for role:', user.role);
    return <LoadingScreen />;
  }

  console.log('🎯 AppContent: User authenticated and stable, showing main layout');
  return <ElimshaLayout />;
};

export default AppContent;
