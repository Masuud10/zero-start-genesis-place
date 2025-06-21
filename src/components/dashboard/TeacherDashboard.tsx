
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['teacher']} requireSchoolAssignment={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Stats Overview */}
          <div className="w-full">
            <TeacherStatsCards stats={stats} loading={loading} />
          </div>

          {/* Main Content Grid - Reorganized for cleaner layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Primary Teaching Tools */}
            <div className="xl:col-span-2 space-y-6">
              {/* Teaching Actions - Most important section first */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <TeacherActions user={user} onModalOpen={handleModalOpen} />
              </div>
              
              {/* Grade Management */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <TeacherGradesManager />
              </div>
              
              {/* Analytics Summary */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <TeacherAnalyticsSummaryCard />
              </div>
            </div>

            {/* Right Column - Schedule & Classes */}
            <div className="xl:col-span-1 space-y-6">
              {/* Timetable - Quick reference */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <CompactTeacherTimetable />
              </div>
              
              {/* My Classes */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <MyClasses />
              </div>
            </div>
          </div>
        </div>

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
