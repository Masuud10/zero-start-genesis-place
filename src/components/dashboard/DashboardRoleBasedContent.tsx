
import React from 'react';
import { AuthUser } from '@/types/auth';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import SystemAdminDashboard from './SystemAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import ParentDashboard from './ParentDashboard';
import FinanceOfficerDashboard from './FinanceOfficerDashboard';

interface DashboardRoleBasedContentProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const DashboardRoleBasedContent: React.FC<DashboardRoleBasedContentProps> = ({
  user,
  onModalOpen
}) => {
  const { isSystemAdmin, schoolId, isReady } = useSchoolScopedData();

  console.log('📊 DashboardRoleBasedContent: Rendering for role:', user.role, {
    isSystemAdmin,
    schoolId,
    userSchoolId: user.school_id,
    isReady
  });

  // Wait for school scoped data to be ready
  if (!isReady) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // System admins (elimisha_admin, edufam_admin)
  if (isSystemAdmin) {
    return <SystemAdminDashboard user={user} onModalOpen={onModalOpen} />;
  }

  // School-level administrators - fix validation logic
  if (user.role === 'school_owner' || user.role === 'principal') {
    if (!schoolId) {
      return (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">School Assignment Required</h3>
          <p className="text-yellow-700">
            Your account needs to be assigned to a school. Please contact your system administrator.
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            User ID: {user.id?.slice(0, 8)}... | Role: {user.role}
          </p>
        </div>
      );
    }
    return <SchoolAdminDashboard user={user} onModalOpen={onModalOpen} />;
  }

  // Teachers - fix validation logic
  if (user.role === 'teacher') {
    if (!schoolId) {
      return (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">School Assignment Required</h3>
          <p className="text-yellow-700">
            Your account needs to be assigned to a school. Please contact your school administrator.
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            User ID: {user.id?.slice(0, 8)}... | Role: {user.role}
          </p>
        </div>
      );
    }
    return <TeacherDashboard user={user} onModalOpen={onModalOpen} />;
  }

  // Finance officers - fix validation logic
  if (user.role === 'finance_officer') {
    if (!schoolId) {
      return (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">School Assignment Required</h3>
          <p className="text-yellow-700">
            Your account needs to be assigned to a school. Please contact your school administrator.
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            User ID: {user.id?.slice(0, 8)}... | Role: {user.role}
          </p>
        </div>
      );
    }
    return <FinanceOfficerDashboard user={user} onModalOpen={onModalOpen} />;
  }

  // Parents - don't require school assignment as they may have children in multiple schools
  if (user.role === 'parent') {
    return <ParentDashboard user={user} onModalOpen={onModalOpen} />;
  }

  // Fallback for unknown roles - add more debugging info
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold text-red-800 mb-2">Role Configuration Error</h3>
      <p className="text-red-700 mb-4">
        Your account role "{user.role}" is not recognized. Please contact your administrator.
      </p>
      <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
        <strong>Debug Info:</strong><br />
        User ID: {user.id?.slice(0, 8)}...<br />
        Email: {user.email}<br />
        Role: {user.role || 'None'}<br />
        School ID: {user.school_id || 'None'}<br />
        Is System Admin: {isSystemAdmin ? 'Yes' : 'No'}<br />
        Current School ID: {schoolId || 'None'}
      </div>
    </div>
  );
};

export default DashboardRoleBasedContent;
