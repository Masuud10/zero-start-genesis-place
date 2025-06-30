import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EduFamAdminDashboard from '@/components/dashboard/EduFamAdminDashboard';
import PrincipalDashboard from '@/components/dashboard/PrincipalDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import ParentDashboard from '@/components/dashboard/ParentDashboard';
import FinanceOfficerDashboard from '@/components/dashboard/FinanceOfficerDashboard';
import GradesModule from '@/components/modules/GradesModule';
import AttendanceModule from '@/components/modules/AttendanceModule';
import StudentsModule from '@/components/modules/StudentsModule';
import FinanceModule from '@/components/modules/FinanceModule';
import FeeManagementModule from '@/components/modules/FeeManagementModule';
import StudentAccountsModule from '@/components/modules/StudentAccountsModule';
import FinanceSettingsModule from '@/components/modules/FinanceSettingsModule';
import TimetableModule from '@/components/modules/TimetableModule';
import AnnouncementsModule from '@/components/modules/AnnouncementsModule';
import MessagesModule from '@/components/modules/MessagesModule';
import ReportsModule from '@/components/modules/ReportsModule';
import SchoolsModule from '@/components/modules/SchoolsModule';
import UsersModule from '@/components/modules/UsersModule';
import BillingModule from '@/components/modules/BillingModule';
import SystemHealthModule from '@/components/modules/SystemHealthModule';
import SecurityModule from '@/components/modules/SecurityModule';
import SupportModule from '@/components/modules/SupportModule';
import CertificatesModule from '@/components/modules/CertificatesModule';
import ProjectHubModule from '@/components/modules/ProjectHubModule';
import CompanyManagementModule from '@/components/modules/CompanyManagementModule';
import SystemSettings from '@/components/settings/SystemSettings';
import EduFamAnalyticsOverview from '@/components/analytics/EduFamAnalyticsOverview';
import SchoolAnalyticsList from '@/components/analytics/SchoolAnalyticsList';
import SchoolOwnerDashboard from '../dashboard/SchoolOwnerDashboard';
import MpesaPaymentsPanel from '@/components/finance/MpesaPaymentsPanel';
import FinancialReportsPanel from '@/components/finance/FinancialReportsPanel';
import FinanceAnalyticsPanel from '@/components/finance/FinanceAnalyticsPanel';
import StudentAccountsPanel from '@/components/finance/StudentAccountsPanel';
import FinanceSettingsPanel from '@/components/finance/FinanceSettingsPanel';

interface ContentRendererProps {
  activeSection: string;
  onModalOpen?: (modalType: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ activeSection }) => {
  const { user } = useAuth();
  
  console.log('📋 ContentRenderer: Rendering section:', activeSection, 'for user role:', user?.role);

  // Dashboard sections - role-specific content
  if (activeSection === 'dashboard') {
    switch (user?.role) {
      case 'edufam_admin':
      case 'elimisha_admin':
        return <EduFamAdminDashboard />;
      case 'school_owner':
        return <SchoolOwnerDashboard />;
      case 'principal':
        return <PrincipalDashboard user={user} />;
      case 'teacher':
        return <TeacherDashboard user={user} />;
      case 'finance_officer':
        return <FinanceOfficerDashboard user={user} />;
      case 'parent':
        return <ParentDashboard user={user} />;
      default:
        return <div>Unknown user role: {user?.role}</div>;
    }
  }

  // System Settings - Only for EduFam Admins
  if (activeSection === 'settings') {
    return <SystemSettings />;
  }

  // Analytics sections
  if (activeSection === 'analytics') {
    if (user?.role === 'edufam_admin' || user?.role === 'elimisha_admin') {
      return <EduFamAnalyticsOverview />;
    }
    return <div>Analytics access restricted to system administrators</div>;
  }

  // Finance-specific routes - ensure proper access control
  const financeRoles = ['finance_officer', 'principal', 'school_owner'];
  const hasFinanceAccess = financeRoles.includes(user?.role || '');

  // Finance sub-modules
  switch (activeSection) {
    case 'fee-management':
      if (hasFinanceAccess) {
        return <FeeManagementModule />;
      }
      return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
    case 'mpesa-payments':
      if (hasFinanceAccess) {
        return <MpesaPaymentsPanel />;
      }
      return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
    case 'financial-reports':
      if (hasFinanceAccess) {
        return <FinancialReportsPanel />;
      }
      return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
    case 'financial-analytics':
      if (hasFinanceAccess) {
        return <FinanceAnalyticsPanel />;
      }
      return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
    case 'student-accounts':
      if (hasFinanceAccess) {
        return <StudentAccountsPanel />;
      }
      return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
    case 'finance-settings':
      if (hasFinanceAccess) {
        return <FinanceSettingsPanel />;
      }
      return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;

    // Other sections with role-based access
    case 'project-hub':
      // Only EduFam admins can access Project Hub
      if (user?.role === 'edufam_admin') {
        return <ProjectHubModule />;
      }
      return <div>Project Hub access restricted to EduFam administrators</div>;
    case 'school-analytics':
      // Only EduFam admins can access School Analytics
      if (user?.role === 'edufam_admin') {
        return <SchoolAnalyticsList />;
      }
      return <div>School Analytics access restricted to EduFam administrators</div>;
    case 'company-management':
      // Only EduFam admins can access Company Management
      if (user?.role === 'edufam_admin') {
        return <CompanyManagementModule />;
      }
      return <div>Company Management access restricted to EduFam administrators</div>;
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
    case 'schools':
      return <SchoolsModule />;
    case 'users':
      return <UsersModule />;
    case 'billing':
      return <BillingModule />;
    case 'system-health':
      return <SystemHealthModule />;
    case 'security':
      return <SecurityModule />;
    case 'support':
      return <SupportModule />;
    case 'certificates':
      return <CertificatesModule />;
    default:
      console.warn('📋 ContentRenderer: Unknown section:', activeSection);
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Section Not Found: {activeSection}
            </h3>
            <p className="text-gray-600">
              The requested section could not be found or is not available for your role.
            </p>
          </div>
        </div>
      );
  }
};

export default ContentRenderer;
