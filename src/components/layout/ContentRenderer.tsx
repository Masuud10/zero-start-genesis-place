
import React, { memo, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EduFamAdminDashboard from '@/components/dashboard/EduFamAdminDashboard';
import PrincipalDashboard from '@/components/dashboard/PrincipalDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import ParentDashboard from '@/components/dashboard/ParentDashboard';
import FinanceOfficerDashboard from '@/components/dashboard/FinanceOfficerDashboard';

// Lazy load heavy components to improve performance
const GradesModule = React.lazy(() => import('@/components/modules/GradesModule'));
const AttendanceModule = React.lazy(() => import('@/components/modules/AttendanceModule'));
const StudentsModule = React.lazy(() => import('@/components/modules/StudentsModule'));
const FinanceModule = React.lazy(() => import('@/components/modules/FinanceModule'));
const FeeManagementModule = React.lazy(() => import('@/components/modules/FeeManagementModule'));
const StudentAccountsModule = React.lazy(() => import('@/components/modules/StudentAccountsModule'));
const FinanceSettingsModule = React.lazy(() => import('@/components/modules/FinanceSettingsModule'));
const TimetableModule = React.lazy(() => import('@/components/modules/TimetableModule'));
const AnnouncementsModule = React.lazy(() => import('@/components/modules/AnnouncementsModule'));
const MessagesModule = React.lazy(() => import('@/components/modules/MessagesModule'));
const ReportsModule = React.lazy(() => import('@/components/modules/ReportsModule'));
const SchoolsModule = React.lazy(() => import('@/components/modules/SchoolsModule'));
const UsersModule = React.lazy(() => import('@/components/modules/UsersModule'));
const BillingModule = React.lazy(() => import('@/components/modules/BillingModule'));
const SystemHealthModule = React.lazy(() => import('@/components/modules/SystemHealthModule'));
const SecurityModule = React.lazy(() => import('@/components/modules/SecurityModule'));
const SupportModule = React.lazy(() => import('@/components/modules/SupportModule'));
const CertificatesModule = React.lazy(() => import('@/components/modules/CertificatesModule'));
const ProjectHubModule = React.lazy(() => import('@/components/modules/ProjectHubModule'));
const CompanyManagementModule = React.lazy(() => import('@/components/modules/CompanyManagementModule'));
const SystemSettings = React.lazy(() => import('@/components/settings/SystemSettings'));
const EduFamAnalyticsOverview = React.lazy(() => import('@/components/analytics/EduFamAnalyticsOverview'));
const SchoolAnalyticsList = React.lazy(() => import('@/components/analytics/SchoolAnalyticsList'));
const SchoolOwnerDashboard = React.lazy(() => import('../dashboard/SchoolOwnerDashboard'));
const MpesaPaymentsPanel = React.lazy(() => import('@/components/finance/MpesaPaymentsPanel'));
const FinancialReportsPanel = React.lazy(() => import('@/components/finance/FinancialReportsPanel'));
const FinanceAnalyticsPanel = React.lazy(() => import('@/components/finance/FinanceAnalyticsPanel'));
const StudentAccountsPanel = React.lazy(() => import('@/components/finance/StudentAccountsPanel'));
const FinanceSettingsPanel = React.lazy(() => import('@/components/finance/FinanceSettingsPanel'));
const SchoolManagementDashboard = React.lazy(() => import('@/components/dashboard/principal/SchoolManagementDashboard'));
const AnalyticsDashboard = React.lazy(() => import('@/components/analytics/AnalyticsDashboard'));

interface ContentRendererProps {
  activeSection: string;
  onModalOpen?: (modalType: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = memo(({ activeSection }) => {
  const { user } = useAuth();
  
  console.log('📋 ContentRenderer: Rendering section:', activeSection, 'for user role:', user?.role);

  // Memoize role-based access checks to prevent unnecessary recalculations
  const hasFinanceAccess = useMemo(() => {
    const financeRoles = ['finance_officer', 'principal', 'school_owner'];
    return financeRoles.includes(user?.role || '');
  }, [user?.role]);

  // Memoize dashboard component to prevent unnecessary re-renders
  const dashboardComponent = useMemo(() => {
    if (activeSection !== 'dashboard') return null;
    
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
  }, [activeSection, user?.role, user]);

  // Return dashboard component if it's the dashboard section
  if (dashboardComponent) {
    return dashboardComponent;
  }

  // Render other sections with lazy loading and error boundaries
  const renderLazyComponent = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
    <React.Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <Component />
    </React.Suspense>
  );

  // School Management - Fix access for principals
  if (activeSection === 'school-management') {
    if (user?.role === 'principal') {
      return renderLazyComponent(SchoolManagementDashboard);
    }
    return <div className="p-8 text-center text-red-600">Access Denied: Principal access required</div>;
  }

  // System Settings - Only for EduFam Admins
  if (activeSection === 'settings') {
    return renderLazyComponent(SystemSettings);
  }

  // Analytics sections - Fix access for principals
  if (activeSection === 'analytics') {
    if (user?.role === 'edufam_admin' || user?.role === 'elimisha_admin') {
      return renderLazyComponent(EduFamAnalyticsOverview);
    }
    // Allow principals to access their school analytics
    if (user?.role === 'principal' || user?.role === 'school_owner') {
      return renderLazyComponent(AnalyticsDashboard);
    }
    return <div className="p-8 text-center text-red-600">Access Denied: Analytics access restricted</div>;
  }

  // Finance sub-modules
  switch (activeSection) {
    case 'fee-management':
      if (hasFinanceAccess) {
        return renderLazyComponent(FeeManagementModule);
      }
      return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
    case 'mpesa-payments':
      if (hasFinanceAccess) {
        return renderLazyComponent(MpesaPaymentsPanel);
      }
      return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
    case 'financial-reports':
      if (hasFinanceAccess) {
        return renderLazyComponent(FinancialReportsPanel);
      }
      return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
    case 'financial-analytics':
      if (hasFinanceAccess) {
        return renderLazyComponent(FinanceAnalyticsPanel);
      }
      return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
    case 'student-accounts':
      if (hasFinanceAccess) {
        return renderLazyComponent(StudentAccountsPanel);
      }
      return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;
    case 'finance-settings':
      if (hasFinanceAccess) {
        return renderLazyComponent(FinanceSettingsPanel);
      }
      return <div className="p-8 text-center text-red-600">Access Denied: Finance access required</div>;

    // Other sections with role-based access
    case 'project-hub':
      if (user?.role === 'edufam_admin') {
        return renderLazyComponent(ProjectHubModule);
      }
      return <div>Project Hub access restricted to EduFam administrators</div>;
    case 'school-analytics':
      if (user?.role === 'edufam_admin') {
        return renderLazyComponent(SchoolAnalyticsList);
      }
      return <div>School Analytics access restricted to EduFam administrators</div>;
    case 'company-management':
      if (user?.role === 'edufam_admin') {
        return renderLazyComponent(CompanyManagementModule);
      }
      return <div>Company Management access restricted to EduFam administrators</div>;
    case 'grades':
      return renderLazyComponent(GradesModule);
    case 'attendance':
      return renderLazyComponent(AttendanceModule);
    case 'students':
      return renderLazyComponent(StudentsModule);
    case 'finance':
      return renderLazyComponent(FinanceModule);
    case 'timetable':
      return renderLazyComponent(TimetableModule);
    case 'announcements':
      return renderLazyComponent(AnnouncementsModule);
    case 'messages':
      return renderLazyComponent(MessagesModule);
    case 'reports':
      return renderLazyComponent(ReportsModule);
    case 'schools':
      return renderLazyComponent(SchoolsModule);
    case 'users':
      return renderLazyComponent(UsersModule);
    case 'billing':
      return renderLazyComponent(BillingModule);
    case 'system-health':
      return renderLazyComponent(SystemHealthModule);
    case 'security':
      return renderLazyComponent(SecurityModule);
    case 'support':
      return renderLazyComponent(SupportModule);
    case 'certificates':
      return renderLazyComponent(CertificatesModule);
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
});

ContentRenderer.displayName = 'ContentRenderer';

export default ContentRenderer;
