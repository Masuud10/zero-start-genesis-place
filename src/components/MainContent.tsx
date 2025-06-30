
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
import FinanceSettingsModule from './modules/FinanceSettingsModule';
import TimetableModule from './modules/TimetableModule';
import AnnouncementsModule from './modules/AnnouncementsModule';
import MessagesModule from './modules/MessagesModule';
import ReportsModule from './modules/ReportsModule';
import SchoolActivityLogsModule from './modules/SchoolActivityLogsModule';
import SystemAuditLogsModule from './modules/SystemAuditLogsModule';
import SupportModule from './modules/SupportModule';
import SettingsModule from './modules/SettingsModule';
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
import MpesaPaymentsPanel from './finance/MpesaPaymentsPanel';
import FinancialReportsPanel from './finance/FinancialReportsPanel';
import FinanceAnalyticsPanel from './finance/FinanceAnalyticsPanel';
import StudentAccountsPanel from './finance/StudentAccountsPanel';
import FinanceSettingsPanel from './finance/FinanceSettingsPanel';

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const { activeSection } = useNavigation();

  console.log('🎯 MainContent: Rendering section:', activeSection, 'for role:', user?.role);

  // Helper function to check finance access
  const hasFinanceAccess = () => {
    const financeRoles = ['finance_officer', 'principal', 'school_owner'];
    return financeRoles.includes(user?.role || '');
  };

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

      // Finance-specific routes
      case 'fee-management':
        if (hasFinanceAccess()) {
          return <FeeManagementModule />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
      case 'mpesa-payments':
        if (hasFinanceAccess()) {
          return <MpesaPaymentsPanel />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
      case 'financial-reports':
        if (hasFinanceAccess()) {
          return <FinancialReportsPanel />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
      case 'financial-analytics':
        if (hasFinanceAccess()) {
          return <FinanceAnalyticsPanel />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
      case 'student-accounts':
        if (hasFinanceAccess()) {
          return <StudentAccountsPanel />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
      case 'finance-settings':
        if (hasFinanceAccess()) {
          return <FinanceSettingsPanel />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;

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
