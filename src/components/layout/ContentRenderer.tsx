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
import SchoolManagementModule from '@/components/modules/SchoolManagementModule';
import CertificatesModule from '@/components/modules/CertificatesModule';
import SystemSettings from '@/components/settings/SystemSettings';
import EduFamAnalyticsOverview from '@/components/analytics/EduFamAnalyticsOverview';
import SchoolOwnerDashboard from '../dashboard/SchoolOwnerDashboard';

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

  // Other sections with role-based access
  switch (activeSection) {
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
    case 'school-management':
      return <SchoolManagementModule />;
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
