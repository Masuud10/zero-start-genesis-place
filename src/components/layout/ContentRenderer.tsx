
import React from 'react';
import Dashboard from '@/components/Dashboard';
import GradesModule from '@/components/modules/GradesModule';
import AttendanceModule from '@/components/modules/AttendanceModule';
import StudentsModule from '@/components/modules/StudentsModule';
import FinanceModule from '@/components/modules/FinanceModule';
import TimetableModule from '@/components/modules/TimetableModule';
import AnnouncementsModule from '@/components/modules/AnnouncementsModule';
import MessagesModule from '@/components/modules/MessagesModule';
import ReportsModule from '@/components/modules/ReportsModule';
import SupportModule from '@/components/modules/SupportModule';
import SettingsModule from '@/components/modules/SettingsModule';
import SecurityModule from '@/components/modules/SecurityModule';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import SchoolsModule from '@/components/modules/SchoolsModule';
import UsersModule from '@/components/modules/UsersModule';
import BillingModule from '@/components/modules/BillingModule';
import SystemHealthModule from '@/components/modules/SystemHealthModule';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import ProcessPaymentsModule from '@/components/modules/ProcessPaymentsModule';
import StudentAccountsModule from '@/components/modules/StudentAccountsModule';
import FinanceReportsModule from '@/components/modules/FinanceReportsModule';

const ContentRenderer: React.FC = () => {
  const { activeSection } = useNavigation();
  const { user } = useAuth();

  switch (activeSection) {
    case 'dashboard': return <Dashboard />;
    case 'analytics': return <AnalyticsDashboard />;
    case 'grades': return <GradesModule />;
    case 'attendance': return <AttendanceModule />;
    case 'students': return <StudentsModule />;
    case 'finance': return <FinanceModule />;
    case 'payments': return <ProcessPaymentsModule />;
    case 'student-accounts': return <StudentAccountsModule />;
    case 'timetable': return <TimetableModule />;
    case 'announcements': return <AnnouncementsModule />;
    case 'messages': return <MessagesModule />;
    case 'reports':
      if (user?.role === 'finance_officer') {
        return <FinanceReportsModule />;
      }
      return <ReportsModule />;
    case 'support': return <SupportModule />;
    case 'settings': return <SettingsModule />;
    case 'security': return <SecurityModule />;
    case 'schools': return <SchoolsModule />;
    case 'users': return <UsersModule />;
    case 'billing': return <BillingModule />;
    case 'system-health': return <SystemHealthModule />;
    default:
      return <Dashboard />;
  }
};

export default ContentRenderer;
