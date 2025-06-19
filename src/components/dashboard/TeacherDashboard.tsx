
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
import TeacherGradesManager from './teacher/TeacherGradesManager';
import BulkGradingModal from '@/components/grading/BulkGradingModal';
import AttendanceModal from '@/components/modals/AttendanceModal';
import GradesModal from '@/components/modals/GradesModal';
import { useToast } from '@/hooks/use-toast';

interface TeacherDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onModalOpen }) => {
  const { isReady } = useSchoolScopedData();
  const { stats, loading } = useTeacherDashboardStats(user);
  const { toast } = useToast();
  
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
        // Try to delegate to parent
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

  const handleModalSuccess = (modalType: string, message?: string) => {
    handleModalClose(modalType);
    if (message) {
      toast({
        title: "Success",
        description: message,
      });
    }
  };

  // Prevent any render before role/school_id are ready
  if (!isReady) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['teacher']} requireSchoolAssignment={true}>
      <div className="space-y-6">
        {/* Stats Overview */}
        <TeacherStatsCards stats={stats} loading={loading} />

        {/* Teacher Analytics Overview */}
        <TeacherAnalyticsSummaryCard />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Grade Management */}
          <div className="lg:col-span-1">
            <TeacherGradesManager />
          </div>

          {/* Right Column - Classes and Timetable */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MyClasses />
              <CompactTeacherTimetable />
            </div>
          </div>
        </div>

        {/* Teaching Tools Section */}
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
