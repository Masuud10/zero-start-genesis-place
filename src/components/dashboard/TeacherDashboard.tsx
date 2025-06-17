
import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import TeacherAnalyticsSummaryCard from "@/components/analytics/TeacherAnalyticsSummaryCard";
import RoleGuard from "@/components/common/RoleGuard";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useTeacherDashboardStats } from "@/hooks/useTeacherDashboardStats";
import TeacherStatsCards from './teacher/TeacherStatsCards';
import TeacherActions from './teacher/TeacherActions';
import MyClasses from './teacher/MyClasses';
import CompactTeacherTimetable from './teacher/CompactTeacherTimetable';
import BulkGradingModal from '@/components/grading/BulkGradingModal';
import AttendanceModal from '@/components/modals/AttendanceModal';
import GradesModal from '@/components/modals/GradesModal';

interface TeacherDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onModalOpen }) => {
  const { isReady } = useSchoolScopedData();
  const { stats, loading } = useTeacherDashboardStats(user);
  
  // Modal states - managed locally for better control
  const [bulkGradingOpen, setBulkGradingOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [gradesModalOpen, setGradesModalOpen] = useState(false);

  const handleModalOpen = (modalType: string) => {
    console.log('TeacherDashboard: Opening modal:', modalType);
    
    switch (modalType) {
      case 'bulkGrading':
        setBulkGradingOpen(true);
        break;
      case 'attendance':
        setAttendanceModalOpen(true);
        break;
      case 'grades':
        setGradesModalOpen(true);
        break;
      case 'reports':
      case 'studentAdmission':
      case 'teacherAdmission':
      case 'addClass':
      case 'addSubject':
        // Delegate to parent for these modals
        onModalOpen(modalType);
        break;
      default:
        console.warn('Unknown modal type:', modalType);
        onModalOpen(modalType);
    }
  };

  const handleModalClose = (modalType: string) => {
    console.log('TeacherDashboard: Closing modal:', modalType);
    
    switch (modalType) {
      case 'bulkGrading':
        setBulkGradingOpen(false);
        break;
      case 'attendance':
        setAttendanceModalOpen(false);
        break;
      case 'grades':
        setGradesModalOpen(false);
        break;
    }
  };

  // Prevent any render before role/school_id are ready
  if (!isReady) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['teacher']} requireSchoolAssignment={true}>
      <div className="space-y-6">
        <TeacherStatsCards stats={stats} loading={loading} />

        {/* Teacher Analytics Overview */}
        <TeacherAnalyticsSummaryCard />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <MyClasses />
          <CompactTeacherTimetable />
        </div>

        <TeacherActions user={user} onModalOpen={handleModalOpen} />

        {/* Local Modals - Teacher specific */}
        {bulkGradingOpen && (
          <BulkGradingModal 
            open={bulkGradingOpen}
            onClose={() => handleModalClose('bulkGrading')}
            classList={[]}
            subjectList={[]}
          />
        )}
        
        {attendanceModalOpen && (
          <AttendanceModal 
            onClose={() => handleModalClose('attendance')} 
            userRole={user.role} 
          />
        )}
        
        {gradesModalOpen && (
          <GradesModal 
            onClose={() => handleModalClose('grades')} 
            userRole={user.role} 
          />
        )}
      </div>
    </RoleGuard>
  );
};

export default TeacherDashboard;
