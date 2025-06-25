
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Dashboard from './Dashboard';
import AnnouncementsModule from './modules/AnnouncementsModule';
import GradesModule from './modules/GradesModule';
import AttendanceModule from './modules/AttendanceModule';
import StudentsModule from './modules/StudentsModule';
import FinanceModule from './modules/FinanceModule';
import TimetableModule from './modules/TimetableModule';
import MessagesModule from './modules/MessagesModule';
import ReportsModule from './modules/ReportsModule';
import SupportModule from './modules/SupportModule';
import SettingsModule from './modules/SettingsModule';
import SecurityModule from './modules/SecurityModule';
import SchoolsModule from './modules/SchoolsModule';
import UsersModule from './modules/UsersModule';
import BillingModule from './modules/BillingModule';
import SystemHealthModule from './modules/SystemHealthModule';
import ProjectHubModule from './modules/ProjectHubModule';
import ProcessPaymentsModule from './modules/ProcessPaymentsModule';
import StudentAccountsModule from './modules/StudentAccountsModule';
import FeeManagementModule from './modules/FeeManagementModule';
import FinanceSettingsModule from './modules/FinanceSettingsModule';
import SchoolActivityLogsModule from './modules/SchoolActivityLogsModule';
import SystemAuditLogsModule from './modules/SystemAuditLogsModule';
import SystemSettings from './settings/SystemSettings';
import MaintenanceSettings from './settings/MaintenanceSettings';
import DatabaseSettings from './settings/DatabaseSettings';
import SecuritySettingsPanel from './settings/SecuritySettingsPanel';
import NotificationSettings from './settings/NotificationSettings';
import UserManagementSettings from './settings/UserManagementSettings';
import CompanySettings from './settings/CompanySettings';

interface MainContentProps {
  activeModule: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeModule }) => {
  const { user } = useAuth();
  const { canAccessRoute } = useRoleBasedRouting();

  // Role-based access control for audit logs
  const canAccessSchoolLogs = canAccessRoute(['principal', 'school_owner']);
  const canAccessSystemLogs = canAccessRoute(['edufam_admin']);
  const canAccessSystemSettings = canAccessRoute(['edufam_admin']);

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'project-hub':
        return canAccessRoute(['edufam_admin']) ? <ProjectHubModule /> : <Dashboard />;
      case 'announcements':
        return <AnnouncementsModule />;
      case 'grades':
        return <GradesModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'students':
        return <StudentsModule />;
      case 'finance':
        return <FinanceModule />;
      case 'payments':
        return canAccessRoute(['finance_officer']) ? <ProcessPaymentsModule /> : <Dashboard />;
      case 'student-accounts':
        return canAccessRoute(['finance_officer']) ? <StudentAccountsModule /> : <Dashboard />;
      case 'fee-management':
        return canAccessRoute(['finance_officer']) ? <FeeManagementModule /> : <Dashboard />;
      case 'finance-settings':
        return canAccessRoute(['finance_officer']) ? <FinanceSettingsModule /> : <Dashboard />;
      case 'timetable':
        return <TimetableModule />;
      case 'messages':
        return <MessagesModule />;
      case 'reports':
        return <ReportsModule />;
      case 'school-activity-logs':
        return canAccessSchoolLogs ? <SchoolActivityLogsModule /> : <Dashboard />;
      case 'system-audit-logs':
        return canAccessSystemLogs ? <SystemAuditLogsModule /> : <Dashboard />;
      case 'support':
        return <SupportModule />;
      case 'settings':
        return <SettingsModule />;
      case 'security':
        return <SecurityModule />;
      case 'schools':
        return canAccessRoute(['edufam_admin']) ? <SchoolsModule /> : <Dashboard />;
      case 'users':
        return canAccessRoute(['edufam_admin']) ? <UsersModule /> : <Dashboard />;
      case 'billing':
        return canAccessRoute(['edufam_admin']) ? <BillingModule /> : <Dashboard />;
      case 'system-health':
        return canAccessRoute(['edufam_admin']) ? <SystemHealthModule /> : <Dashboard />;
      
      // System Settings Routes
      case 'system-settings':
        return canAccessSystemSettings ? <SystemSettings /> : <Dashboard />;
      case 'system-settings-maintenance':
        return canAccessSystemSettings ? <div className="p-6"><MaintenanceSettings /></div> : <Dashboard />;
      case 'system-settings-database':
        return canAccessSystemSettings ? <div className="p-6"><DatabaseSettings /></div> : <Dashboard />;
      case 'system-settings-security':
        return canAccessSystemSettings ? <div className="p-6"><SecuritySettingsPanel /></div> : <Dashboard />;
      case 'system-settings-notifications':
        return canAccessSystemSettings ? <div className="p-6"><NotificationSettings /></div> : <Dashboard />;
      case 'system-settings-users':
        return canAccessSystemSettings ? <div className="p-6"><UserManagementSettings /></div> : <Dashboard />;
      case 'system-settings-company':
        return canAccessSystemSettings ? <div className="p-6"><CompanySettings /></div> : <Dashboard />;
      
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainContent;
