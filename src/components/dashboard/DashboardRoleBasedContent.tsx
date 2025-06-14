
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

  console.log('📊 DashboardRoleBasedContent: Routing based on role:', user.role);

  // System admins (edufam_admin) - these users have system-wide access
  if (user.role === 'edufam_admin') {
    console.log('📊 DashboardRoleBasedContent: Rendering SystemAdminDashboard for edufam_admin');
    return <SystemAdminDashboard user={user} onModalOpen={onModalOpen} />;
  }

  // School-level administrators (school_owner, principal)
  if (user.role === 'school_owner' || user.role === 'principal') {
    console.log('📊 DashboardRoleBasedContent: Rendering SchoolAdminDashboard for:', user.role);
    
    // Validate school assignment for school-level roles
    if (!user.school_id) {
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

  // Teachers - must be assigned to a school
  if (user.role === 'teacher') {
    console.log('📊 DashboardRoleBasedContent: Rendering TeacherDashboard for teacher');
    
    if (!user.school_id) {
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

  // Finance officers - must be assigned to a school
  if (user.role === 'finance_officer') {
    console.log('📊 DashboardRoleBasedContent: Rendering FinanceOfficerDashboard for finance_officer');
    
    if (!user.school_id) {
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

  // Parents - can access without school assignment as they may have children in multiple schools
  if (user.role === 'parent') {
    console.log('📊 DashboardRoleBasedContent: Rendering ParentDashboard for parent');
    return <ParentDashboard user={user} onModalOpen={onModalOpen} />;
  }

  // Fallback for unknown or invalid roles
  console.error('📊 DashboardRoleBasedContent: Unknown role detected:', user.role);
  
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
