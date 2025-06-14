
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
  const { user, isLoading, error } = useAuth();
  const { isLoading: schoolLoading } = useSchool();

  // Stability check to prevent premature rendering
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsStable(true);
      }, 200); // Increased delay for better stability
      
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
    userSchoolId: user?.school_id,
    showLogin,
    userEmail: user?.email
  });

  // Handle authentication errors
  if (error) {
    console.log('🎯 AppContent: Auth error detected, showing login form:', error);
    return <LoginForm />;
  }

  // Show loading screen while authentication is initializing
  if (isLoading || !isStable) {
    console.log('🎯 AppContent: Auth loading or stabilizing, showing loading screen');
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

  // Critical: Validate user has a role before proceeding
  if (!user.role) {
    console.error('🎯 AppContent: CRITICAL - Authenticated user has no role:', {
      userId: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata
    });
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Setup Required</h2>
          <p className="text-gray-600 mb-4">
            Your account role has not been configured. Please contact your administrator.
          </p>
          <div className="text-xs text-gray-400 mb-4 bg-gray-100 p-2 rounded text-left">
            <strong>Debug Information:</strong><br />
            Email: {user.email}<br />
            Role: {user.role || 'None'}<br />
            User ID: {user.id?.slice(0, 8)}...<br />
            School ID: {user.school_id || 'None'}<br />
            User Metadata: {JSON.stringify(user.user_metadata)}<br />
            App Metadata: {JSON.stringify(user.app_metadata)}
          </div>
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

  // School context loading check for roles that require school data
  const rolesThatNeedSchoolData = ['principal', 'teacher', 'school_owner', 'finance_officer'];
  const needsSchoolData = rolesThatNeedSchoolData.includes(user.role);
  
  if (needsSchoolData && schoolLoading) {
    console.log('🎯 AppContent: School data loading for role that requires it:', user.role);
    return <LoadingScreen />;
  }

  console.log('🎯 AppContent: All checks passed, rendering main layout for user with role:', user.role);
  
  // Render the main application layout
  return <ElimshaLayout />;
};

export default AppContent;
