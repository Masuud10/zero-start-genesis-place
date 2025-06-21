
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Dashboard Components
import EduFamAdminDashboard from '@/components/dashboard/EduFamAdminDashboard';
import PrincipalDashboard from '@/components/dashboard/PrincipalDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import ParentDashboard from '@/components/dashboard/ParentDashboard';
import FinanceOfficerDashboard from '@/components/dashboard/FinanceOfficerDashboard';
import SchoolOwnerDashboard from '@/components/dashboard/SchoolOwnerDashboard';

// Analytics Components
import EduFamAdminAnalytics from '@/components/analytics/EduFamAdminAnalytics';
import PrincipalAnalytics from '@/components/analytics/PrincipalAnalytics';
import TeacherAnalytics from '@/components/analytics/TeacherAnalytics';
import ParentAnalytics from '@/components/analytics/ParentAnalytics';
import FinanceOfficerAnalytics from '@/components/analytics/FinanceOfficerAnalytics';
import SchoolOwnerAnalytics from '@/components/analytics/SchoolOwnerAnalytics';

// Module Components
import GradesModule from '@/components/modules/GradesModule';
import AttendanceModule from '@/components/modules/AttendanceModule';
import StudentsModule from '@/components/modules/StudentsModule';
import FinanceModule from '@/components/modules/FinanceModule';
import TimetableModule from '@/components/modules/TimetableModule';
import AnnouncementsModule from '@/components/modules/AnnouncementsModule';
import MessagesModule from '@/components/modules/MessagesModule';
import ReportsModule from '@/components/modules/ReportsModule';
import SupportModule from '@/components/modules/SupportModule';
import SecurityModule from '@/components/modules/SecurityModule';
import SettingsModule from '@/components/modules/SettingsModule';
import SchoolsModule from '@/components/modules/SchoolsModule';
import UsersModule from '@/components/modules/UsersModule';
import BillingModule from '@/components/modules/BillingModule';
import SystemHealthModule from '@/components/modules/SystemHealthModule';
import CertificatesModule from '@/components/modules/CertificatesModule';
import CompanyManagementModule from '@/components/modules/CompanyManagementModule';

interface ContentRendererProps {
  activeSection: string;
  onModalOpen: (modalType: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ activeSection, onModalOpen }) => {
  const { user } = useAuth();

  console.log('🎯 ContentRenderer: Rendering section:', activeSection, 'for role:', user?.role);

  // Default analytics filters
  const defaultFilters = {
    term: new Date().getFullYear().toString(),
    class: '',
    subject: '',
    dateRange: 'current_term'
  };

  const renderContent = () => {
    switch (activeSection) {
      // Dashboard sections
      case 'dashboard':
        switch (user?.role) {
          case 'edufam_admin':
            return <EduFamAdminDashboard onModalOpen={onModalOpen} />;
          case 'principal':
            return <PrincipalDashboard user={user} onModalOpen={onModalOpen} />;
          case 'teacher':
            return <TeacherDashboard user={user} onModalOpen={onModalOpen} />;
          case 'parent':
            return <ParentDashboard user={user} onModalOpen={onModalOpen} />;
          case 'finance_officer':
            return <FinanceOfficerDashboard />;
          case 'school_owner':
            return <SchoolOwnerDashboard />;
          default:
            return <div>Dashboard not configured for this role</div>;
        }

      // Analytics sections
      case 'analytics':
        switch (user?.role) {
          case 'edufam_admin':
            return <EduFamAdminAnalytics />;
          case 'principal':
            return <PrincipalAnalytics />;
          case 'teacher':
            return <TeacherAnalytics filters={defaultFilters} />;
          case 'parent':
            return <ParentAnalytics filters={defaultFilters} />;
          case 'finance_officer':
            return <FinanceOfficerAnalytics filters={defaultFilters} />;
          case 'school_owner':
            return <SchoolOwnerAnalytics filters={defaultFilters} />;
          default:
            return <div>Analytics not available for this role</div>;
        }

      // Management modules
      case 'schools':
        return <SchoolsModule />;
      
      case 'company-management':
        return <CompanyManagementModule />;
      
      case 'users':
        return <UsersModule />;
      
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
      
      case 'certificates':
        return <CertificatesModule />;
      
      case 'billing':
        return <BillingModule />;
      
      case 'system-health':
        return <SystemHealthModule />;
      
      case 'support':
        return <SupportModule />;
      
      case 'security':
        return <SecurityModule />;
      
      case 'settings':
        return <SettingsModule />;

      default:
        console.warn('🚨 ContentRenderer: Unknown section:', activeSection);
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Section Not Found</h3>
              <p className="text-gray-500 mt-2">The requested section "{activeSection}" is not available.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto px-6 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default ContentRenderer;
