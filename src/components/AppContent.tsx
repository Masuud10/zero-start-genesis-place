
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
  
  // Always call hooks first - no conditional hook calls
  const { user, isLoading, error } = useAuth();
  
  // Safe school context access - may not be available
  let schoolLoading = false;
  try {
    const schoolContext = useSchool();
    schoolLoading = schoolContext.isLoading;
  } catch (err) {
    // School context not available, continue without it
    console.log('🎯 AppContent: School context not available, continuing without it');
  }

  // Stability check with shorter delay
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsStable(true);
      }, 50); // Very short delay
      
      return () => clearTimeout(timer);
    } else {
      setIsStable(false);
    }
  }, [isLoading]);

  console.log('🎯 AppContent: Rendering state:', { 
    hasUser: !!user, 
    isLoading, 
    error,
    schoolLoading,
    isStable,
    userRole: user?.role,
    userEmail: user?.email
  });

  // Handle authentication errors
  if (error) {
    console.log('🎯 AppContent: Auth error detected, showing login form:', error);
    return <LoginForm />;
  }

  // Show loading screen while actively loading
  if (isLoading) {
    console.log('🎯 AppContent: Auth loading, showing loading screen');
    return <LoadingScreen />;
  }

  // Wait for stability only briefly
  if (!isStable) {
    console.log('🎯 AppContent: Waiting for auth state to stabilize');
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

  console.log('🎯 AppContent: Rendering main layout for user with role:', user.role);
  
  return <ElimshaLayout />;
};

export default AppContent;
