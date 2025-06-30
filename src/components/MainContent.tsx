
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import ProjectHubModule from './modules/ProjectHubModule';
import CompanyManagementModule from './modules/CompanyManagementModule';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import SchoolAnalyticsOverview from './analytics/SchoolAnalyticsOverview';
import SchoolAnalyticsList from './analytics/SchoolAnalyticsList';
import GradesModule from './modules/GradesModule';
import AttendanceModule from './modules/AttendanceModule';
import StudentsModule from './modules/StudentsModule';
import FinanceModule from './modules/FinanceModule';
import ProcessPaymentsModule from './modules/ProcessPaymentsModule';
import StudentAccountsModule from './modules/StudentAccountsModule';
import FeeManagementModule from './modules/FeeManagementModule';
import TimetableModule from './modules/TimetableModule';
import AnnouncementsModule from './modules/AnnouncementsModule';
import MessagesModule from './modules/MessagesModule';
import ReportsModule from './modules/ReportsModule';
import SchoolActivityLogsModule from './modules/SchoolActivityLogsModule';
import SystemAuditLogsModule from './modules/SystemAuditLogsModule';
import SupportModule from './modules/SupportModule';
import SettingsModule from './modules/SettingsModule';
import FinanceSettingsModule from './modules/FinanceSettingsModule';
import SecurityModule from './modules/SecurityModule';
import SchoolsModule from './modules/SchoolsModule';
import UsersModule from './modules/UsersModule';
import BillingModule from './modules/BillingModule';
import SystemHealthModule from './modules/SystemHealthModule';
import SystemSettings from './settings/SystemSettings';
import EduFamAdminDashboard from './dashboard/EduFamAdminDashboard';
import PrincipalDashboard from './dashboard/PrincipalDashboard';
import TeacherDashboard from './dashboard/TeacherDashboard';
import ParentDashboard from './dashboard/ParentDashboard';
import FinanceOfficerDashboard from './dashboard/FinanceOfficerDashboard';
import SchoolOwnerDashboard from './dashboard/SchoolOwnerDashboard';

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const { activeSection } = useNavigation();

  console.log('🎯 MainContent: Rendering section:', activeSection, 'for role:', user?.role);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        // Render role-specific dashboard
        switch (user?.role) {
          case 'edufam_admin':
            return <EduFamAdminDashboard />;
          case 'principal':
            return <PrincipalDashboard user={user} />;
          case 'teacher':
            return <TeacherDashboard user={user} />;
          case 'parent':
            return <ParentDashboard user={user} />;
          case 'finance_officer':
            return <FinanceOfficerDashboard user={user} />;
          case 'school_owner':
            return <SchoolOwnerDashboard />;
          default:
            return <EduFamAdminDashboard />;
        }
      case 'project-hub':
        // Only EduFam admins can access Project Hub
        if (user?.role === 'edufam_admin') {
          return <ProjectHubModule />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Project Hub is only available to EduFam administrators</div>;
      case 'company-management':
        // Only EduFam admins can access Company Management
        if (user?.role === 'edufam_admin') {
          return <CompanyManagementModule />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Company Management is only available to EduFam administrators</div>;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'school-analytics':
        // Show individual school analytics for EduFam admins
        if (user?.role === 'edufam_admin') {
          return <SchoolAnalyticsList />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Insufficient permissions</div>;
      case 'schools-analytics':
        return <SchoolAnalyticsOverview />;
      case 'grades':
        return <GradesModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'students':
        return <StudentsModule />;
      case 'finance':
        return <FinanceModule />;
      case 'payments':
        return <ProcessPaymentsModule />;
      case 'student-accounts':
        return <StudentAccountsModule />;
      case 'fee-management':
        return <FeeManagementModule />;
      case 'timetable':
        return <TimetableModule />;
      case 'announcements':
        return <AnnouncementsModule />;
      case 'messages':
        return <MessagesModule />;
      case 'reports':
        return <ReportsModule />;
      case 'school-activity-logs':
        return <SchoolActivityLogsModule />;
      case 'system-audit-logs':
        return <SystemAuditLogsModule />;
      case 'support':
        return <SupportModule />;
      case 'settings':
        return <SettingsModule />;
      case 'finance-settings':
        return <FinanceSettingsModule />;
      case 'security':
        return <SecurityModule />;
      case 'schools':
        return <SchoolsModule />;
      case 'users':
        return <UsersModule />;
      case 'billing':
        return <BillingModule />;
      case 'system-health':
        return <SystemHealthModule />;
      // System Settings routes
      case 'system-settings':
      case 'maintenance':
      case 'database':
      case 'notifications':
      case 'user-management':
      case 'company-settings':
        return <SystemSettings />;
      default:
        console.warn('🚨 MainContent: Unknown section:', activeSection);
        // Return role-specific dashboard as fallback
        switch (user?.role) {
          case 'edufam_admin':
            return <EduFamAdminDashboard />;
          case 'principal':
            return <PrincipalDashboard user={user} />;
          case 'teacher':
            return <TeacherDashboard user={user} />;
          case 'parent':
            return <ParentDashboard user={user} />;
          case 'finance_officer':
            return <FinanceOfficerDashboard user={user} />;
          case 'school_owner':
            return <SchoolOwnerDashboard />;
          default:
            return <EduFamAdminDashboard />;
        }
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {renderContent()}
    </div>
  );
};

export default MainContent;
