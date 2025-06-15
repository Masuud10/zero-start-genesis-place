
import React from 'react';
import { UserRole } from '@/types/user';

import DownloadReportButton from "@/components/reports/DownloadReportButton";
import ClassFilterBar from '@/components/grades/ClassFilterBar';
import GradeStatsCards from '@/components/grades/GradeStatsCards';
import NoGradebookPermission from '@/components/grades/NoGradebookPermission';
import GradeOverviewPanel from '@/components/grades/GradeOverviewPanel';

interface GradesMainPanelProps {
  hasPermission: (perm: string) => boolean;
  user: any,
  availableClasses: Array<{ id: string; name: string }>,
  selectedClassId: string | null,
  setSelectedClassId: (id: string | null) => void,
  isModalOpen: boolean,
  handleOpenModal: () => void,
  handleCloseModal: () => void,
  showBulkModal: boolean,
  setShowBulkModal: (b: boolean) => void,
  handleSaveGrades: (grades: { studentId: string; score: number; isAbsent: boolean }[]) => void,
  handleSubmitGrades: () => void,
  mockGradingSession: any,
  mockClassId: any,
  mockSubjectId: string,
  mockTerm: string,
  mockExamType: "MID_TERM" | "OPENER" | "END_TERM",
  mockMaxScore: number,
  mockStudents: { id: string, name: string }[]
}

const gradeStats = {
  totalStudents: 1247,
  averageScore: 78.5,
  topPerformingSubject: 'Mathematics',
  studentsAbove90: 320
};

const GradesMainPanel: React.FC<GradesMainPanelProps> = ({
  hasPermission,
  user,
  availableClasses,
  selectedClassId,
  setSelectedClassId,
  isModalOpen,
  handleOpenModal,
  handleCloseModal,
  showBulkModal,
  setShowBulkModal,
  handleSaveGrades,
  handleSubmitGrades,
  mockGradingSession,
  mockClassId,
  mockSubjectId,
  mockTerm,
  mockExamType,
  mockMaxScore,
  mockStudents,
}) => {
  if (!hasPermission('view_gradebook')) {
    return (
      <NoGradebookPermission
        role={user?.role}
        hasPermission={hasPermission('view_gradebook')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {user?.role === 'edufam_admin' ? 'System-Wide Grade Overview' : 'Grade Management'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'edufam_admin' 
              ? 'System administrator view - grade summaries across all schools'
              : 'Manage and track student grades, performance analytics, and reporting.'
            }
          </p>
        </div>
        {hasPermission('view_gradebook') && (
          <DownloadReportButton
            type="grades"
            label="Download Grades Report"
            queryFilters={user?.role === 'edufam_admin' ? {} : { school_id: user?.school_id }}
          />
        )}
      </div>
      <ClassFilterBar
        availableClasses={availableClasses}
        selectedClassId={selectedClassId}
        onSelectClass={setSelectedClassId}
      />
      <GradeStatsCards stats={gradeStats} role={user?.role} />
      <GradeOverviewPanel
        user={user}
        hasPermission={hasPermission}
        mockGradingSession={mockGradingSession}
        mockClassId={mockClassId}
        mockSubjectId={mockSubjectId}
        mockTerm={mockTerm}
        mockExamType={mockExamType}
        mockMaxScore={mockMaxScore}
        mockStudents={mockStudents}
        isModalOpen={isModalOpen}
        onOpenModal={handleOpenModal}
        onCloseModal={handleCloseModal}
        showBulkModal={showBulkModal}
        setShowBulkModal={setShowBulkModal}
        handleSaveGrades={handleSaveGrades}
        handleSubmitGrades={handleSubmitGrades}
      />
    </div>
  );
};

export default GradesMainPanel;
