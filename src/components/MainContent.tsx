
import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import SchoolManagementDashboard from '@/components/dashboard/principal/SchoolManagementDashboard';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import FinancialOverview from '@/components/finance/FinancialOverview';
import FeeManagementModule from '@/components/finance/FeeManagementModule';
import MpesaPaymentsModule from '@/components/finance/MpesaPaymentsModule';
import FinancialReportsModule from '@/components/finance/FinancialReportsModule';
import FinancialAnalyticsModule from '@/components/finance/FinancialAnalyticsModule';
import GradesModule from '@/components/modules/GradesModule';
import AttendanceModule from '@/components/modules/AttendanceModule';
import StudentsModule from '@/components/modules/StudentsModule';
import TimetableModule from '@/components/modules/TimetableModule';
import AnnouncementsModule from '@/components/modules/AnnouncementsModule';
import MessagesModule from '@/components/modules/MessagesModule';
import ReportsModule from '@/components/modules/ReportsModule';
import SupportModule from '@/components/modules/SupportModule';
import SettingsModule from '@/components/modules/SettingsModule';
import SecurityModule from '@/components/modules/SecurityModule';
import SchoolsModule from '@/components/modules/SchoolsModule';
import UsersModule from '@/components/modules/UsersModule';
import BillingModule from '@/components/modules/BillingModule';
import SystemHealthModule from '@/components/modules/SystemHealthModule';
import EduFamAdminDashboard from '@/components/dashboard/EduFamAdminDashboard';
import PrincipalDashboard from '@/components/dashboard/PrincipalDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import ParentDashboard from '@/components/dashboard/ParentDashboard';
import FinanceOfficerDashboard from '@/components/dashboard/FinanceOfficerDashboard';
import SchoolOwnerDashboard from '@/components/dashboard/SchoolOwnerDashboard';

const MainContent: React.FC = () => {
  const { activeSection } = useNavigation();
  const { user } = useAuth();

  console.log('🎯 MainContent: Rendering section:', activeSection, 'for user role:', user?.role);

  const renderDashboard = () => {
    switch (user?.role) {
      case 'edufam_admin':
        return <EduFamAdminDashboard />;
      case 'principal':
        return <PrincipalDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'parent':
        return <ParentDashboard />;
      case 'finance_officer':
        return <FinanceOfficerDashboard />;
      case 'school_owner':
        return <SchoolOwnerDashboard />;
      default:
        return <div>Welcome to Edufam</div>;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'school-management':
        return <SchoolManagementDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'grades':
        return <GradesModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'students':
        return <StudentsModule />;
      case 'finance':
        return <FinancialOverview />;
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
      case 'fee-management':
        return <FeeManagementModule />;
      case 'mpesa-payments':
        return <MpesaPaymentsModule />;
      case 'financial-reports':
        return <FinancialReportsModule />;
      case 'financial-analytics':
        return <FinancialAnalyticsModule />;
      default:
        return <div>Content for {activeSection}</div>;
    }
  };

  return (
    <div className="flex-1 p-4">
      {renderContent()}
    </div>
  );
};

export default MainContent;
