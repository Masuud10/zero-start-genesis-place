import React, { useState, useMemo, useEffect } from 'react';
import SchoolSummaryFilter from '../shared/SchoolSummaryFilter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/utils/permissions';
import { UserRole } from '@/types/user';
import { useClasses } from '@/hooks/useClasses';
import ClassFilterBar from '@/components/grades/ClassFilterBar';
import GradeStatsCards from '@/components/grades/GradeStatsCards';
import NoGradebookPermission from '@/components/grades/NoGradebookPermission';
import GradeOverviewPanel from '@/components/grades/GradeOverviewPanel';
import DownloadReportButton from "@/components/reports/DownloadReportButton";
import GradesAdminSummary from './GradesAdminSummary';
import GradesMainPanel from './GradesMainPanel';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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

  // Stats
  const gradeStats = {
    totalStudents: 1247,
    averageScore: 78.5,
    topPerformingSubject: 'Mathematics',
    studentsAbove90: 320
  };

  // Summary state for Admin
  const isEdufamAdmin = user?.role === 'edufam_admin';
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [gradesSummary, setGradesSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch schools for school filter
  useEffect(() => {
    if (!isEdufamAdmin) return;
    setLoading(true);
    supabase.from("schools")
      .select("id, name")
      .then(({ data, error }) => {
        if (error) setError("Failed to fetch schools list. Please try again later.");
        else setSchools(data || []);
        setLoading(false);
      });
  }, [isEdufamAdmin]);

  // Fetch summary from view only (no details)
  useEffect(() => {
    if (!isEdufamAdmin) return;
    setLoading(true);
    setError(null);
    let query = (supabase as any)
      .from("school_grades_summary")
      .select("*");
    if (schoolFilter) {
      query = query.eq("school_id", schoolFilter);
    }
    query.then(({ data, error }: any) => {
      if (error) {
        setError("Could not load grades summary data. Please try again shortly.");
        setGradesSummary(null);
      } else if (!data || data.length === 0) {
        setGradesSummary(null);
      } else {
        setGradesSummary(data[0]);
      }
      setLoading(false);
    });
  }, [isEdufamAdmin, schoolFilter]);

  if (isEdufamAdmin) {
    if (loading) {
      return (
        <div className="p-6 flex items-center">
          <span className="animate-spin h-6 w-6 mr-2 rounded-full border-2 border-blue-400 border-t-transparent"></span>
          Loading summary...
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive" className="my-8">
          <AlertTitle>Could not load summary</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      );
    }
    if (!gradesSummary) {
      return (
        <Alert className="my-8">
          <AlertTitle>No Summary Data</AlertTitle>
          <AlertDescription>
            There is no grades summary available for this school or filter. Try selecting a different school or check back later.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <GradesAdminSummary
        loading={loading}
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
  }

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
};

export default GradesModule;
