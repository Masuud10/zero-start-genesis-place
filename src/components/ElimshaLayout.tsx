
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import Dashboard from './Dashboard';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import SchoolsModule from './modules/SchoolsModule';
import BillingModule from './modules/BillingModule';
import SystemHealthModule from './modules/SystemHealthModule';
import UsersModule from './modules/UsersModule';
import SupportModule from './modules/SupportModule';
import SettingsModule from './modules/SettingsModule';
import ReportsModule from './modules/ReportsModule';
import GradesModule from './modules/GradesModule';
import AttendanceModule from './modules/AttendanceModule';
import StudentsModule from './modules/StudentsModule';
import FinanceModule from './modules/FinanceModule';
import TimetableModule from './modules/TimetableModule';
import AnnouncementsModule from './modules/AnnouncementsModule';
import MessagesModule from './modules/MessagesModule';

const ElimshaLayout = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
      case 'system-analytics':
        return <AnalyticsDashboard />;
      case 'grades':
        return <GradesModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'students':
        return <StudentsModule />;
      case 'finance':
        return <FinanceModule />;
      case 'timetable':
        return <TimetableModule />;
      case 'announcements':
        return <AnnouncementsModule />;
      case 'messages':
        return <MessagesModule />;
      case 'schools':
        return <SchoolsModule />;
      case 'users':
        return <UsersModule />;
      case 'billing':
        return <BillingModule />;
      case 'system-health':
        return <SystemHealthModule />;
      case 'support':
        return <SupportModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ElimshaLayout;
