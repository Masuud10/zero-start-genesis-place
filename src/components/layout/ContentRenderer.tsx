import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/components/Dashboard';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import SchoolAnalyticsDashboard from '@/components/analytics/SchoolAnalyticsDashboard';
import EduFamAdminDashboard from '@/components/dashboard/EduFamAdminDashboard';
import PrincipalDashboard from '@/components/dashboard/PrincipalDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import ParentDashboard from '@/components/dashboard/ParentDashboard';
import FinanceDashboard from '@/components/dashboard/FinanceDashboard';
import SchoolManagementDashboard from '@/components/dashboard/SchoolManagementDashboard';
import GradesDashboard from '@/components/grades/GradesDashboard';
import AttendanceDashboard from '@/components/attendance/AttendanceDashboard';
import StudentsDashboard from '@/components/students/StudentsDashboard';
import FinanceOverviewDashboard from '@/components/finance/FinanceOverviewDashboard';
import PaymentsDashboard from '@/components/payments/PaymentsDashboard';
import StudentAccountsDashboard from '@/components/finance/StudentAccountsDashboard';
import FeeManagementDashboard from '@/components/finance/FeeManagementDashboard';
import TimetableDashboard from '@/components/timetable/TimetableDashboard';
import AnnouncementsDashboard from '@/components/announcements/AnnouncementsDashboard';
import MessagesDashboard from '@/components/messages/MessagesDashboard';
import ReportsDashboard from '@/components/reports/ReportsDashboard';
import SupportDashboard from '@/components/support/SupportDashboard';
import SettingsDashboard from '@/components/settings/SettingsDashboard';
import FinanceSettingsDashboard from '@/components/finance/FinanceSettingsDashboard';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import SchoolsDashboard from '@/components/schools/SchoolsDashboard';
import UsersDashboard from '@/components/users/UsersDashboard';
import BillingDashboard from '@/components/billing/BillingDashboard';
import SystemHealthDashboard from '@/components/system-health/SystemHealthDashboard';

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
      
      case 'analytics':
        return <AnalyticsDashboard />;
      
      case 'school-analytics':
        return <SchoolAnalyticsDashboard />;
      
      case 'school-management':
        return <SchoolManagementDashboard />;

      case 'grades':
        return <GradesDashboard />;

      case 'attendance':
        return <AttendanceDashboard />;

      case 'students':
        return <StudentsDashboard />;

      case 'finance':
        return <FinanceOverviewDashboard />;

      case 'payments':
        return <PaymentsDashboard />;

      case 'student-accounts':
        return <StudentAccountsDashboard />;

      case 'fee-management':
        return <FeeManagementDashboard />;

      case 'timetable':
        return <TimetableDashboard />;

      case 'announcements':
        return <AnnouncementsDashboard />;

      case 'messages':
        return <MessagesDashboard />;

      case 'reports':
        return <ReportsDashboard />;

      case 'support':
        return <SupportDashboard />;

      case 'settings':
        return <SettingsDashboard />;

      case 'finance-settings':
        return <FinanceSettingsDashboard />;

      case 'security':
        return <SecurityDashboard />;

      case 'schools':
        return <SchoolsDashboard />;

      case 'users':
        return <UsersDashboard />;

      case 'billing':
        return <BillingDashboard />;

      case 'system-health':
        return <SystemHealthDashboard />;

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
