
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Dashboard from '@/components/Dashboard';
import GradesModule from '@/components/modules/GradesModule';
import AttendanceModule from '@/components/modules/AttendanceModule';
import StudentsModule from '@/components/modules/StudentsModule';
import FinanceModule from '@/components/modules/FinanceModule';
import TimetableModule from '@/components/modules/TimetableModule';
import AnnouncementsModule from '@/components/modules/AnnouncementsModule';
import MessagesModule from '@/components/modules/MessagesModule';
import ReportsModule from '@/components/modules/ReportsModule';
import SupportModule from '@/components/modules/SupportModule';
import SettingsModule from '@/components/modules/SettingsModule';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import SchoolsModule from '@/components/modules/SchoolsModule';
import UsersModule from '@/components/modules/UsersModule';
import BillingModule from '@/components/modules/BillingModule';
import SystemHealthModule from '@/components/modules/SystemHealthModule';
import { useAuth } from '@/contexts/AuthContext';

const ElimshaLayout = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user } = useAuth();

  const renderContent = () => {
    // Check if user has access to the requested section
    const hasAccess = (section: string) => {
      if (user?.role === 'elimisha_admin' || user?.role === 'edufam_admin') {
        return true; // Admin has access to everything
      }

      // School owner restrictions
      if (user?.role === 'school_owner') {
        const restrictedSections = ['grades', 'attendance', 'students', 'timetable', 'support'];
        if (restrictedSections.includes(section)) {
          return false;
        }
      }

      return true;
    };

    // If user doesn't have access, redirect to dashboard
    if (!hasAccess(activeSection)) {
      setActiveSection('dashboard');
      return <Dashboard />;
    }

    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
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
      case 'reports':
        return <ReportsModule />;
      case 'support':
        return <SupportModule />;
      case 'settings':
        // Only show settings for elimisha_admin and edufam_admin
        return (user?.role === 'elimisha_admin' || user?.role === 'edufam_admin') 
          ? <SettingsModule /> 
          : <Dashboard />;
      case 'schools':
        return <SchoolsModule />;
      case 'users':
        return <UsersModule />;
      case 'billing':
        return <BillingModule />;
      case 'system-health':
        return <SystemHealthModule />;
      case 'system-analytics':
        return <AnalyticsDashboard />;
      default:
        return <Dashboard />;
    }
  };

  const handleSectionChange = (section: string) => {
    console.log(`🔄 Switching to section: ${section} for user role: ${user?.role}`);
    setActiveSection(section);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
        />
        <SidebarInset className="flex-1">
          <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ElimshaLayout;
