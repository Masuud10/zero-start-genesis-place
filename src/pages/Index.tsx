
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import ElimshaLayout from '@/components/ElimshaLayout';
import LandingPage from '@/components/LandingPage';
import AnnouncementsModule from '@/components/modules/AnnouncementsModule';
import MessagesModule from '@/components/modules/MessagesModule';
import SupportModule from '@/components/modules/SupportModule';
import StudentsModule from '@/components/modules/StudentsModule';
import GradesModule from '@/components/modules/GradesModule';
import AttendanceModule from '@/components/modules/AttendanceModule';
import FinanceModule from '@/components/modules/FinanceModule';
import TimetableModule from '@/components/modules/TimetableModule';
import ReportsModule from '@/components/modules/ReportsModule';
import SettingsModule from '@/components/modules/SettingsModule';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  console.log('📄 Index: Rendering with state', { 
    hasUser: !!user, 
    isLoading, 
    userEmail: user?.email,
    activeSection,
    showLogin
  });

  if (isLoading) {
    console.log('📄 Index: Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-2xl text-white">🎓</span>
          </div>
          <p className="text-muted-foreground">Loading Elimisha school management system...</p>
          <div className="text-xs text-gray-400">
            Debug: {isLoading ? 'Loading...' : 'Not loading'} | User: {user ? 'Present' : 'None'}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('📄 Index: Showing landing page or login form');
    
    if (showLogin) {
      return <LoginForm />;
    }
    
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  console.log('📄 Index: Showing main app for user:', user.email);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'grades':
        return <GradesModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'finance':
        return <FinanceModule />;
      case 'timetable':
        return <TimetableModule />;
      case 'announcements':
        return <AnnouncementsModule />;
      case 'messages':
        return <MessagesModule />;
      case 'support':
        return <SupportModule />;
      case 'students':
        return <StudentsModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ElimshaLayout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </ElimshaLayout>
  );
};

export default Index;
