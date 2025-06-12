
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import LoginForm from '@/components/LoginForm';

const AppContent = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: schoolLoading } = useSchool();
  const [showLogin, setShowLogin] = useState(false);

  console.log('🎯 AppContent: Rendering', { 
    hasUser: !!user, 
    authLoading, 
    schoolLoading,
    userRole: user?.role,
    userSchoolId: user?.school_id,
    showLogin
  });

  // Show loading only while auth is initializing
  if (authLoading) {
    console.log('🎯 AppContent: Auth loading, showing loading screen');
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

  // For authenticated users, only show loading for school data if user needs school context
  // Parents don't need school loading since they access their children's data differently
  if (user && schoolLoading && user.role !== 'parent') {
    console.log('🎯 AppContent: User authenticated but schools loading');
    return <LoadingScreen />;
  }

  console.log('🎯 AppContent: User authenticated, showing main layout');
  return <ElimshaLayout />;
};

export default AppContent;
