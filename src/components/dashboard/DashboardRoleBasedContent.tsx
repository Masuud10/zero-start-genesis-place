
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
  const { isSystemAdmin, schoolId } = useSchoolScopedData();

  console.log('📊 DashboardRoleBasedContent: Rendering for role:', user.role, {
    isSystemAdmin,
    schoolId,
    userSchoolId: user.school_id
  });

  // System admins (elimisha_admin, edufam_admin)
  if (isSystemAdmin) {
    return <SystemAdminDashboard user={user} onModalOpen={onModalOpen} />;
  }

  // School-level administrators
  if (user.role === 'school_owner' || user.role === 'principal') {
    if (!schoolId) {
      return (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">School Assignment Required</h3>
          <p className="text-yellow-700">
            Your account needs to be assigned to a school. Please contact your system administrator.
          </p>
        </div>
      );
    }
    return <SchoolAdminDashboard user={user} onModalOpen={onModalOpen} />;
  }

  // Teachers
  if (user.role === 'teacher') {
    if (!schoolId) {
      return (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">School Assignment Required</h3>
          <p className="text-yellow-700">
            Your account needs to be assigned to a school. Please contact your school administrator.
          </p>
        </div>
      );
    }
    return <TeacherDashboard user={user} onModalOpen={onModalOpen} />;
  }

  // Finance officers
  if (user.role === 'finance_officer') {
    if (!schoolId) {
      return (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">School Assignment Required</h3>
          <p className="text-yellow-700">
            Your account needs to be assigned to a school. Please contact your school administrator.
          </p>
        </div>
      );
    }
    return <FinanceOfficerDashboard user={user} onModalOpen={onModalOpen} />;
  }

  // Parents
  if (user.role === 'parent') {
    return <ParentDashboard user={user} onModalOpen={onModalOpen} />;
  }

  // Fallback for unknown roles
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold text-red-800 mb-2">Role Configuration Error</h3>
      <p className="text-red-700">
        Your account role "{user.role}" is not recognized. Please contact your administrator.
      </p>
    </div>
  );
};

export default DashboardRoleBasedContent;
