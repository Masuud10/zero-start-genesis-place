
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import LandingPage from '@/components/LandingPage';
import ElimshaLayout from '@/components/ElimshaLayout';
import LoadingScreen from '@/components/common/LoadingScreen';

const AppContent = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: schoolLoading } = useSchool();

  console.log('🎯 AppContent: Rendering', { 
    hasUser: !!user, 
    authLoading, 
    schoolLoading,
    userRole: user?.role,
    userSchoolId: user?.school_id
  });

  if (authLoading || schoolLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    console.log('🎯 AppContent: No user, showing landing page');
    return <LandingPage />;
  }

  console.log('🎯 AppContent: User authenticated, showing main layout');
  return <ElimshaLayout />;
};

export default AppContent;
