import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/components/dashboard/Dashboard';
import SchoolManagementDashboard from '@/components/dashboard/principal/SchoolManagementDashboard';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import GradesDashboard from '@/components/grades/GradesDashboard';
import AttendanceDashboard from '@/components/attendance/AttendanceDashboard';
import StudentsDashboard from '@/components/students/StudentsDashboard';
import FinanceModule from '@/components/modules/FinanceModule';
import TimetableDashboard from '@/components/timetable/TimetableDashboard';
import AnnouncementsDashboard from '@/components/announcements/AnnouncementsDashboard';
import MessagesDashboard from '@/components/messages/MessagesDashboard';
import ReportsDashboard from '@/components/reports/ReportsDashboard';
import SupportDashboard from '@/components/support/SupportDashboard';
import SettingsDashboard from '@/components/settings/SettingsDashboard';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import SchoolsDashboard from '@/components/schools/SchoolsDashboard';
import UsersDashboard from '@/components/users/UsersDashboard';
import BillingDashboard from '@/components/billing/BillingDashboard';
import SystemHealthDashboard from '@/components/system-health/SystemHealthDashboard';
import FinancialOverview from '@/components/finance/FinancialOverview';
import FeeManagementModule from '@/components/finance/FeeManagementModule';
import MpesaPaymentsModule from '@/components/finance/MpesaPaymentsModule';
import FinancialReportsModule from '@/components/finance/FinancialReportsModule';
import FinancialAnalyticsModule from '@/components/finance/FinancialAnalyticsModule';

const MainContent: React.FC = () => {
  const { activeSection } = useNavigation();
  const { user } = useAuth();

  console.log('🎯 MainContent: Rendering section:', activeSection, 'for user role:', user?.role);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'school-management':
        return <SchoolManagementDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'grades':
        return <GradesDashboard />;
      case 'attendance':
        return <AttendanceDashboard />;
      case 'students':
        return <StudentsDashboard />;
      case 'finance':
        return <FinancialOverview />;
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
