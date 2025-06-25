
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import DashboardContainer from './dashboard/DashboardContainer';
import ProjectHubModule from './modules/ProjectHubModule';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
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

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const { activeSection } = useNavigation();

  console.log('🎯 MainContent: Rendering section:', activeSection, 'for role:', user?.role);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContainer />;
      case 'project-hub':
        return <ProjectHubModule />;
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
      case 'system-settings-maintenance':
      case 'system-settings-database':
      case 'system-settings-security':
      case 'system-settings-notifications':
      case 'system-settings-users':
      case 'system-settings-company':
        return <SystemSettings />;
      default:
        console.warn('🚨 MainContent: Unknown section:', activeSection);
        return <DashboardContainer />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {renderContent()}
    </div>
  );
};

export default MainContent;
