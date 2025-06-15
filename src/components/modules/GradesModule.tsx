
import React, { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, PERMISSIONS } from '@/utils/permissions';
import { UserRole } from '@/types/user';
import { useClasses } from '@/hooks/useClasses';

// Split out UI components
import ClassFilterBar from '@/components/grades/ClassFilterBar';
import GradeStatsCards from '@/components/grades/GradeStatsCards';
import NoGradebookPermission from '@/components/grades/NoGradebookPermission';
import GradeOverviewPanel from '@/components/grades/GradeOverviewPanel';

interface GradesModuleProps {}

const GradesModule: React.FC<GradesModuleProps> = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const { user } = useAuth();
  const { hasPermission } = usePermissions(user?.role as UserRole, user?.school_id);

  // Class filtering
  const { classes, loading: loadingClasses } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Class filtering logic
  const availableClasses = useMemo(
    () => classes.map((c) => ({ id: c.id, name: c.name })), 
    [classes]
  );
  const classFilterEnabled = availableClasses.length > 0;

  // Demo/mock data for students (eventually replace with useStudents hook and tie to class)
  const ALL_MOCK_STUDENTS = [
    { studentId: '1', name: 'John Doe', admissionNumber: 'ADM001', rollNumber: 'R001', currentScore: 85, percentage: 85, position: 1, isAbsent: false },
    { studentId: '2', name: 'Jane Smith', admissionNumber: 'ADM002', rollNumber: 'R002', currentScore: 78, percentage: 78, position: 2, isAbsent: false },
    { studentId: '3', name: 'Bob Wilson', admissionNumber: 'ADM003', rollNumber: 'R003', isAbsent: true },
    { studentId: '4', name: 'Ahmed Noor', admissionNumber: 'ADM004', rollNumber: 'R004', currentScore: 60, percentage: 60, position: 4, isAbsent: false },
    { studentId: '5', name: 'Maria Ivanova', admissionNumber: 'ADM005', rollNumber: 'R005', currentScore: 92, percentage: 92, position: 0, isAbsent: false },
  ];

  // Filter mock students by class (simulate: every student in every class in demo)
  const filteredStudents = ALL_MOCK_STUDENTS; // Replace with actual filter for real implementation

  const mockGradingSession = {
    id: 'mock-session',
    classId: selectedClassId || 'mock-class',
    subjectId: 'mock-subject',
    term: 'Term 1',
    examType: 'MID_TERM', // Correct string literal
    maxScore: 100,
    teacherId: 'mock-teacher',
    createdAt: new Date(),
    isActive: true,
    students: filteredStudents,
  };

  const mockClassId = selectedClassId || "mock-class";
  const mockSubjectId = "mock-subject";
  const mockTerm = "Term 1";
  const mockExamType: "MID_TERM" | "OPENER" | "END_TERM" = "MID_TERM"; // Added explicit typing
  const mockMaxScore = 100;
  const mockStudents = useMemo(
    () =>
      filteredStudents.map((stu) => ({
        id: stu.studentId,
        name: stu.name,
      })),
    [filteredStudents]
  );

  const handleSaveGrades = (grades: { studentId: string; score: number; isAbsent: boolean }[]) => {
    // Mock handler - no actual saving for system admins
    console.log('Mock save grades:', grades);
  };

  const handleSubmitGrades = () => {
    // Mock handler - no actual submission for system admins
    console.log('Mock submit grades');
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Stats
  const gradeStats = {
    totalStudents: 1247,
    averageScore: 78.5,
    topPerformingSubject: 'Mathematics',
    studentsAbove90: 320
  };

  // Early access check
  if (!hasPermission(PERMISSIONS.VIEW_GRADEBOOK)) {
    return (
      <NoGradebookPermission
        role={user?.role}
        hasPermission={hasPermission(PERMISSIONS.VIEW_GRADEBOOK)}
      />
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Class Filter */}
      <ClassFilterBar
        availableClasses={availableClasses}
        selectedClassId={selectedClassId}
        onSelectClass={setSelectedClassId}
      />

      {/* Stats Cards */}
      <GradeStatsCards stats={gradeStats} role={user?.role} />

      {/* Grade Overview Panel (main content) */}
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

export default GradesModule;
