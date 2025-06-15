
import React from 'react';
import { AuthUser } from '@/types/auth';
import { useSchoolAdminStats } from '@/hooks/useSchoolAdminStats';
import SchoolAdminWelcomeHeader from './school-admin/SchoolAdminWelcomeHeader';
import SchoolAdminStatsCards from './school-admin/SchoolAdminStatsCards';
import SchoolAdminQuickActions from './school-admin/SchoolAdminQuickActions';

interface SchoolAdminDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ user, onModalOpen }) => {
  console.log('🏫 SchoolAdminDashboard: Rendering for school admin:', user.email, 'Role:', user.role);

  const { stats, loading } = useSchoolAdminStats(user.school_id);

  return (
    <div className="space-y-6">
      <SchoolAdminWelcomeHeader user={user} />
      <SchoolAdminStatsCards stats={stats} loading={loading} />
      <SchoolAdminQuickActions onModalOpen={onModalOpen} />
    </div>
  );
};

export default SchoolAdminDashboard;
