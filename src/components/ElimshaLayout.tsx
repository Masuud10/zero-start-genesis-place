
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ElimshaLayout = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user } = useAuth();

  console.log('🏗️ ElimshaLayout: Rendering for user role:', user?.role, 'active section:', activeSection);

  const hasAccess = (section: string) => {
    if (!user?.role) {
      console.log('🏗️ ElimshaLayout: No user role, denying access to', section);
      return false;
    }

    console.log('🏗️ ElimshaLayout: Checking access for role', user.role, 'to section', section);

    // Admin roles have access to everything
    if (user.role === 'elimisha_admin' || user.role === 'edufam_admin') {
      console.log('🏗️ ElimshaLayout: Admin access granted');
      return true;
    }

    // Role-based access control
    switch (user.role) {
      case 'school_owner':
        // School owners have access to most sections except some admin-only ones
        const ownerRestrictedSections = ['users', 'schools', 'system-health', 'system-analytics'];
        const hasOwnerAccess = !ownerRestrictedSections.includes(section);
        console.log('🏗️ ElimshaLayout: School owner access to', section, ':', hasOwnerAccess);
        return hasOwnerAccess;

      case 'principal':
        // Principals have access to academic and operational sections
        const principalAllowedSections = ['dashboard', 'analytics', 'grades', 'attendance', 'students', 'timetable', 'announcements', 'messages', 'reports', 'support'];
        const hasPrincipalAccess = principalAllowedSections.includes(section);
        console.log('🏗️ ElimshaLayout: Principal access to', section, ':', hasPrincipalAccess);
        return hasPrincipalAccess;

      case 'teacher':
        // Teachers have limited access to teaching-related sections
        const teacherAllowedSections = ['dashboard', 'grades', 'attendance', 'students', 'timetable', 'announcements', 'messages'];
        const hasTeacherAccess = teacherAllowedSections.includes(section);
        console.log('🏗️ ElimshaLayout: Teacher access to', section, ':', hasTeacherAccess);
        return hasTeacherAccess;

      case 'parent':
        // Parents have very limited access
        const parentAllowedSections = ['dashboard', 'announcements', 'messages'];
        const hasParentAccess = parentAllowedSections.includes(section);
        console.log('🏗️ ElimshaLayout: Parent access to', section, ':', hasParentAccess);
        return hasParentAccess;

      case 'finance_officer':
        // Finance officers have access to financial and some operational sections
        const financeAllowedSections = ['dashboard', 'finance', 'students', 'reports', 'announcements', 'messages', 'billing'];
        const hasFinanceAccess = financeAllowedSections.includes(section);
        console.log('🏗️ ElimshaLayout: Finance officer access to', section, ':', hasFinanceAccess);
        return hasFinanceAccess;

      default:
        console.log('🏗️ ElimshaLayout: Unknown role, denying access');
        return false;
    }
  };

  const renderContent = () => {
    console.log('🏗️ ElimshaLayout: Rendering content for section:', activeSection);

    // Check access before rendering
    if (!hasAccess(activeSection)) {
      console.log('🏗️ ElimshaLayout: Access denied, redirecting to dashboard');
      setActiveSection('dashboard');
      return (
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this section. Your role: {user?.role}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      );
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
        return <SettingsModule />;
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
        console.log('🏗️ ElimshaLayout: Unknown section, showing dashboard');
        return <Dashboard />;
    }
  };

  const handleSectionChange = (section: string) => {
    console.log(`🔄 ElimshaLayout: Attempting to switch to section: ${section} for user role: ${user?.role}`);
    
    if (hasAccess(section)) {
      console.log(`✅ ElimshaLayout: Access granted, switching to ${section}`);
      setActiveSection(section);
    } else {
      console.log(`❌ ElimshaLayout: Access denied to ${section}, staying on dashboard`);
      setActiveSection('dashboard');
    }
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
