import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/utils/permissions';
import { UserRole } from '@/types/user';
import { useClasses } from '@/hooks/useClasses';
import GradesMainPanel from './GradesMainPanel';
import GradesAdminSummary from './GradesAdminSummary';
import ParentGradesView from '../grades/ParentGradesView';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const GradesModule: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const { hasPermission } = usePermissions(user?.role as UserRole, user?.school_id);

  const { classes, loading: loadingClasses } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const availableClasses = useMemo(
    () => classes.map((c) => ({ id: c.id, name: c.name })), 
    [classes]
  );
  
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [gradesSummary, setGradesSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  const isSummaryRole = user?.role && ['edufam_admin', 'principal', 'school_owner'].includes(user.role);

  useEffect(() => {
    if (!isSummaryRole) {
        setLoadingSummary(false);
        return;
    }
    setLoadingSummary(true);
    setErrorSummary(null);

    if (user.role === 'edufam_admin') {
        supabase.from("schools").select("id, name")
            .then(({ data, error }) => {
                if (error) setErrorSummary("Failed to fetch schools list.");
                else setSchools(data || []);
            });
    }

    const effectiveSchoolId = user.role === 'edufam_admin' ? schoolFilter : user.school_id;

    if (!effectiveSchoolId && user.role === 'edufam_admin') {
        setGradesSummary(null);
        setLoadingSummary(false);
        return;
    }

    if (!effectiveSchoolId) {
        setErrorSummary("Your account is not associated with a school.");
        setLoadingSummary(false);
        return;
    }

    let query = supabase.from("school_grades_summary").select("*").eq("school_id", effectiveSchoolId);

    query.then(({ data, error }: any) => {
        if (error) {
            setErrorSummary("Could not load grades summary data.");
            setGradesSummary(null);
        } else if (!data || data.length === 0) {
            setGradesSummary(null);
        } else {
            setGradesSummary(data[0]);
        }
        setLoadingSummary(false);
    });
  }, [isSummaryRole, user?.role, user?.school_id, schoolFilter]);

  const renderForSummaryRole = () => {
    if (loadingSummary) {
      return (
        <div className="p-6 flex items-center">
          <span className="animate-spin h-6 w-6 mr-2 rounded-full border-2 border-blue-400 border-t-transparent"></span>
          Loading summary...
        </div>
      );
    }
    if (errorSummary) {
      return (
        <Alert variant="destructive" className="my-8">
          <AlertTitle>Could not load summary</AlertTitle>
          <AlertDescription>{errorSummary}</AlertDescription>
        </Alert>
      );
    }
    if (user?.role === 'edufam_admin' && !schoolFilter && schools.length > 0) {
        return <GradesAdminSummary schools={schools} schoolFilter={schoolFilter} setSchoolFilter={setSchoolFilter} gradesSummary={null} loading={false} error={null} />;
    }
    if (!gradesSummary) {
      const message = user?.role === 'edufam_admin' && schools.length === 0
        ? "No schools found."
        : "There is no grades summary available for this school.";
      return (
        <Alert className="my-8">
          <AlertTitle>No Summary Data</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      );
    }
    return (
      <GradesAdminSummary
        loading={loadingSummary}
        error={null}
        gradesSummary={{
          avg_grade: gradesSummary.average_grade ?? null,
          most_improved_school: '—',
          declining_alerts: 0
        }}
        schools={schools}
        schoolFilter={schoolFilter}
        setSchoolFilter={setSchoolFilter}
      />
    );
  };
  
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

  // Ensure type safety for examType for GradingSession
  const mockExamType: "MID_TERM" | "OPENER" | "END_TERM" = "MID_TERM";

  const mockGradingSession = {
    id: 'mock-session',
    classId: selectedClassId || 'mock-class',
    subjectId: 'mock-subject',
    term: 'Term 1',
    examType: mockExamType,
    maxScore: 100,
    teacherId: 'mock-teacher',
    createdAt: new Date(),
    isActive: true,
    students: filteredStudents,
  };

  const mockClassId = selectedClassId || "mock-class";
  const mockSubjectId = "mock-subject";
  const mockTerm = "Term 1";
  // Use exact union as above for extra props
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

  if (!user) return <div>Loading...</div>;

  switch (user.role) {
    case 'edufam_admin':
    case 'principal':
    case 'school_owner':
      return renderForSummaryRole();
    case 'teacher':
      return (
        <GradesMainPanel
          hasPermission={hasPermission}
          user={user}
          availableClasses={availableClasses}
          selectedClassId={selectedClassId}
          setSelectedClassId={setSelectedClassId}
          isModalOpen={isModalOpen}
          handleOpenModal={handleOpenModal}
          handleCloseModal={handleCloseModal}
          showBulkModal={showBulkModal}
          setShowBulkModal={setShowBulkModal}
          handleSaveGrades={handleSaveGrades}
          handleSubmitGrades={handleSubmitGrades}
          mockGradingSession={mockGradingSession}
          mockClassId={mockClassId}
          mockSubjectId={mockSubjectId}
          mockTerm={mockTerm}
          mockExamType={mockExamType}
          mockMaxScore={mockMaxScore}
          mockStudents={mockStudents}
        />
      );
    case 'parent':
      return <ParentGradesView />;
    default:
      return (
        <div className="p-8">
          <h2 className="text-xl font-bold">You do not have permission to view this page.</h2>
          <p className="text-gray-500">Your role ({user.role}) does not have access to the grades module.</p>
        </div>
      );
  }
};

export default GradesModule;
