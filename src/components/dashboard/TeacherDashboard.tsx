
import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import RoleGuard from "@/components/common/RoleGuard";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useTeacherStats } from "@/hooks/useTeacherStats";
import TeacherStatsCards from './teacher/TeacherStatsCards';
import TeacherToolsSection from './teacher/TeacherToolsSection';
import ClassAnalyticsOverview from './teacher/ClassAnalyticsOverview';
import MyClasses from './teacher/MyClasses';
import CompactTeacherTimetable from './teacher/CompactTeacherTimetable';
import BulkGradingModal from '@/components/grading/BulkGradingModal';
import AttendanceModal from '@/components/modals/AttendanceModal';
import GradesModal from '@/components/modals/GradesModal';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface TeacherDashboardProps {
  user: AuthUser;
  onModalOpen?: (modalType: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onModalOpen }) => {
  const { isReady } = useSchoolScopedData();
  const { data: stats, isLoading } = useTeacherStats();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Modal states
  const [bulkGradingOpen, setBulkGradingOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [gradesModalOpen, setGradesModalOpen] = useState(false);

  const handleActionClick = (actionId: string) => {
    console.log('TeacherDashboard: Action clicked:', actionId);
    
    switch (actionId) {
      case 'class-lists':
        // Navigate to classes view or show classes modal
        navigate('/classes');
        break;
      case 'attendance-tracking':
        setAttendanceModalOpen(true);
        break;
      case 'grade-sheets':
        setGradesModalOpen(true);
        break;
      case 'learning-resources':
        // Navigate to resources or show upload modal
        toast({
          title: "Coming Soon",
          description: "Learning resources upload feature is being developed.",
        });
        break;
      case 'assignment-manager':
        // Navigate to assignments or show assignment modal
        toast({
          title: "Coming Soon",
          description: "Assignment manager feature is being developed.",
        });
        break;
      case 'class-analytics':
        // Scroll to analytics section or navigate to detailed analytics
        const analyticsSection = document.getElementById('class-analytics-section');
        if (analyticsSection) {
          analyticsSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      default:
        console.warn('Unknown action:', actionId);
        if (onModalOpen) {
          onModalOpen(actionId);
        }
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

  // Prevent render before role/school_id are ready
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
            <TeacherStatsCards stats={stats} loading={isLoading} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Primary Teaching Tools */}
            <div className="xl:col-span-2 space-y-6">
              {/* Teaching Tools Section */}
              <TeacherToolsSection 
                user={user} 
                onActionClick={handleActionClick}
                stats={{
                  classCount: stats?.classCount || 0,
                  pendingGrades: stats?.pendingGrades || 0,
                  todayAttendance: stats?.todayAttendance || 0
                }}
              />
            </div>

            {/* Right Column - Schedule & Classes */}
            <div className="xl:col-span-1 space-y-6">
              {/* Timetable */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <CompactTeacherTimetable />
              </div>
              
              {/* My Classes */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <MyClasses />
              </div>
            </div>
          </div>

          {/* Class Analytics Overview Section */}
          <div id="class-analytics-section">
            <ClassAnalyticsOverview />
          </div>
        </div>

        {/* Local Modals */}
        {bulkGradingOpen && (
          <BulkGradingModal 
            open={bulkGradingOpen}
            onClose={() => handleModalClose('bulkGrading')}
            classList={stats?.classes || []}
            subjectList={stats?.subjects || []}
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
