
import React from 'react';
import { AuthUser } from '@/types/auth';
import TeacherAnalyticsSummaryCard from "@/components/analytics/TeacherAnalyticsSummaryCard";
import RoleGuard from "@/components/common/RoleGuard";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useTeacherDashboardStats } from "@/hooks/useTeacherDashboardStats";
import TeacherStatsCards from './teacher/TeacherStatsCards';
import TeacherActions from './teacher/TeacherActions';
import MyClasses from './teacher/MyClasses';
import TeacherTimetable from './teacher/TeacherTimetable';

interface TeacherDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

// Teacher dashboard now requires confirmed role & school assignment before showing content.
// Everything queries strictly by school_id (except EduFam Admin for global).

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onModalOpen }) => {
  const { isReady } = useSchoolScopedData();
  const { stats, loading } = useTeacherDashboardStats(user);

  // Prevent any render before role/school_id are ready
  if (!isReady) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse"><div className="h-6 bg-gray-300 rounded mb-2"></div></div>
      </div>
    );
  }

  // Only show for valid teacher role, with school scoped
  return (
    <RoleGuard allowedRoles={['teacher']} requireSchoolAssignment={true}>
      <div className="space-y-6">
        <TeacherStatsCards stats={stats} loading={loading} />

        {/* Teacher Analytics Overview */}
        {user.role === "teacher" && (
          <TeacherAnalyticsSummaryCard />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <MyClasses />
            <TeacherTimetable />
        </div>

        <TeacherActions user={user} onModalOpen={onModalOpen} />
      </div>
    </RoleGuard>
  );
};

export default TeacherDashboard;
