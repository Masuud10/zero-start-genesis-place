
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/components/Dashboard';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import SchoolAnalyticsDashboard from '@/components/analytics/SchoolAnalyticsDashboard';
import SchoolAnalyticsList from '@/components/analytics/SchoolAnalyticsList';
import EduFamAdminDashboard from '@/components/dashboard/EduFamAdminDashboard';
import PrincipalDashboard from '@/components/dashboard/PrincipalDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import ParentDashboard from '@/components/dashboard/ParentDashboard';
import SchoolManagementDashboard from '@/components/dashboard/principal/SchoolManagementDashboard';
import GradesModule from '@/components/modules/GradesModule';
import AttendanceModule from '@/components/modules/AttendanceModule';
import StudentsModule from '@/components/modules/StudentsModule';
import FinanceModule from '@/components/modules/FinanceModule';
import ProcessPaymentsModule from '@/components/modules/ProcessPaymentsModule';
import StudentAccountsModule from '@/components/modules/StudentAccountsModule';
import FeeManagementModule from '@/components/modules/FeeManagementModule';
import TimetableModule from '@/components/modules/TimetableModule';
import AnnouncementsModule from '@/components/modules/AnnouncementsModule';
import ReportsModule from '@/components/modules/ReportsModule';
import SupportModule from '@/components/modules/SupportModule';
import UserSupportModule from '@/components/modules/UserSupportModule';
import SettingsModule from '@/components/modules/SettingsModule';
import FinanceSettingsModule from '@/components/modules/FinanceSettingsModule';
import SecurityModule from '@/components/modules/SecurityModule';
import SchoolsModule from '@/components/modules/SchoolsModule';
import UsersModule from '@/components/modules/UsersModule';
import BillingModule from '@/components/modules/BillingModule';
import SystemHealthModule from '@/components/modules/SystemHealthModule';
import CompanyManagementModule from '@/components/modules/CompanyManagementModule';
import EduFamCertificateManagement from '@/components/certificates/EduFamCertificateManagement';
import ProjectHubModule from '@/components/modules/ProjectHubModule';
import SystemSettings from '@/components/settings/SystemSettings';

interface ContentRendererProps {
  activeSection: string;
  onModalOpen: (modalType: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  activeSection, 
  onModalOpen 
}) => {
  const { user } = useAuth();

  console.log('🎬 ContentRenderer: Rendering section:', activeSection, 'for user role:', user?.role);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      
      case 'project-hub':
        if (user?.role === 'edufam_admin') {
          return <ProjectHubModule />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Insufficient permissions</div>;
      
      case 'analytics':
        return <AnalyticsDashboard />;
      
      case 'school-analytics':
        // Show individual school analytics for EduFam admins, otherwise show regular school analytics
        if (user?.role === 'edufam_admin') {
          return <SchoolAnalyticsList />;
        }
        return <SchoolAnalyticsDashboard />;
      
      case 'school-management':
        return <SchoolManagementDashboard />;

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

      case 'certificates':
        // Show EduFam certificate management for admins, regular for others
        if (user?.role === 'edufam_admin') {
          return <EduFamCertificateManagement />;
        }
        return <div>Certificate management for school users</div>;

      case 'announcements':
        return <AnnouncementsModule />;

      case 'reports':
        return <ReportsModule />;

      case 'support':
        // Edufam admins see the full support management system
        if (user?.role === 'edufam_admin') {
          return <SupportModule />;
        }
        // All other users see the user support module (submit tickets only)
        return <UserSupportModule />;

      case 'settings':
        return <SettingsModule />;

      case 'finance-settings':
        return <FinanceSettingsModule />;

      case 'security':
        // ONLY EduFam Admins can access security module
        if (user?.role === 'edufam_admin') {
          return <SecurityModule />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Only EduFam Administrators can access security settings</div>;

      case 'schools':
        return <SchoolsModule />;

      case 'users':
        return <UsersModule />;

      case 'company-management':
        return <CompanyManagementModule />;

      case 'billing':
        return <BillingModule />;

      case 'system-health':
        return <SystemHealthModule />;

      // System Settings routes - Handle all system settings subsections
      case 'system-settings':
      case 'system-settings-maintenance':
      case 'system-settings-database':
      case 'system-settings-security':
      case 'system-settings-notifications':
      case 'system-settings-users':
      case 'system-settings-company':
        if (user?.role === 'edufam_admin') {
          return <SystemSettings />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Insufficient permissions</div>;

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Feature Coming Soon
              </h3>
              <p className="text-gray-500">
                The "{activeSection}" feature is being implemented.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 space-y-6">
      {renderContent()}
    </div>
  );
};

export default ContentRenderer;
