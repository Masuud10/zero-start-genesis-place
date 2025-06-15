import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Upload, 
  Download, 
  Filter,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, PERMISSIONS } from '@/utils/permissions';
import { UserRole } from '@/types/user';
import GradesModal from '@/components/modals/GradesModal';
import BulkGradingTable from '@/components/grading/BulkGradingTable';
import BulkGradeUploadModal from "@/components/grading/BulkGradeUploadModal";
import { GradingSession } from '@/types/grading';
import { useClasses } from '@/hooks/useClasses';

interface GradesModuleProps {
  
}

const GradesModule: React.FC<GradesModuleProps> = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const { user } = useAuth();
  const { hasPermission } = usePermissions(user?.role as UserRole, user?.school_id);

  // NEW: Class filtering
  const { classes, loading: loadingClasses } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Fetch students for the selected class (simulate for now)
  // Mocked grading session and students—this should be tied to real data when connected
  const availableClasses = useMemo(() => classes.map((c) => ({ id: c.id, name: c.name })), [classes]);
  const selectedClass = useMemo(() => availableClasses.find(c => c.id === selectedClassId), [availableClasses, selectedClassId]);
  const classFilterEnabled = availableClasses.length > 0;

  // Demo/mock data for students (should replace with real fetch)
  const ALL_MOCK_STUDENTS = [
    { studentId: '1', name: 'John Doe', admissionNumber: 'ADM001', rollNumber: 'R001', currentScore: 85, percentage: 85, position: 1, isAbsent: false },
    { studentId: '2', name: 'Jane Smith', admissionNumber: 'ADM002', rollNumber: 'R002', currentScore: 78, percentage: 78, position: 2, isAbsent: false },
    { studentId: '3', name: 'Bob Wilson', admissionNumber: 'ADM003', rollNumber: 'R003', isAbsent: true },
    { studentId: '4', name: 'Ahmed Noor', admissionNumber: 'ADM004', rollNumber: 'R004', currentScore: 60, percentage: 60, position: 4, isAbsent: false },
    { studentId: '5', name: 'Maria Ivanova', admissionNumber: 'ADM005', rollNumber: 'R005', currentScore: 92, percentage: 92, position: 0, isAbsent: false },
  ];

  // Filter mock students by class (simulate: every student in every class in demo)
  const filteredStudents = ALL_MOCK_STUDENTS; // Replace with real filter logic if available

  const mockGradingSession: GradingSession = {
    id: 'mock-session',
    classId: selectedClassId || 'mock-class',
    subjectId: 'mock-subject',
    term: 'Term 1',
    examType: 'MID_TERM',
    maxScore: 100,
    teacherId: 'mock-teacher',
    createdAt: new Date(),
    isActive: true,
    students: filteredStudents,
  };

  const mockClassId = selectedClassId || "mock-class";
  const mockSubjectId = "mock-subject";
  const mockTerm = "Term 1";
  const mockExamType = "MID_TERM";
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

  // Early access check
  if (!hasPermission(PERMISSIONS.VIEW_GRADEBOOK)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to view grades.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please contact your administrator if you believe you should have access to this feature.
          </p>
          <div className="text-xs text-gray-400 mt-2">
            Role: {user?.role} | Permission: {hasPermission(PERMISSIONS.VIEW_GRADEBOOK) ? 'Allowed' : 'Denied'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const gradeStats = {
    totalStudents: 1247,
    averageScore: 78.5,
    topPerformingSubject: 'Mathematics',
    studentsAbove90: 320
  };

  // Add the missing modal handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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

      {/* NEW: Class Filter Bar */}
      <div className="flex items-center gap-4 mb-2">
        {classFilterEnabled && (
          <>
            <span className="text-sm font-medium">Select Class:</span>
            <div className="min-w-[200px]">
              <Select
                value={selectedClassId || ''}
                onValueChange={setSelectedClassId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((cls) => (
                    <SelectItem value={cls.id} key={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradeStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'edufam_admin' ? 'Across all schools' : 'Enrolled students'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{gradeStats.averageScore}</div>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Subject</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{gradeStats.topPerformingSubject}</div>
            <p className="text-xs text-muted-foreground">By average score</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Above 90</CardTitle>
            <GraduationCap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{gradeStats.studentsAbove90}</div>
            <p className="text-xs text-muted-foreground">Excellence Achievers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
            <CardTitle>
              {user?.role === 'edufam_admin' ? 'Grade Overview (Read-Only)' : hasPermission(PERMISSIONS.EDIT_GRADEBOOK) ? 'Manage Grades' : 'Grade Overview'}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {hasPermission(PERMISSIONS.EDIT_GRADEBOOK) && user?.role !== 'edufam_admin' && (
                <>
                  <Button onClick={handleOpenModal}>
                    Open Grades Modal
                  </Button>
                  <Button
                    onClick={() => setShowBulkModal(true)}
                    variant="default"
                  >
                    Bulk Upload Grades
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {user?.role === 'edufam_admin' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Administrator Access Level</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  As a system administrator, you can view grade summaries and analytics but cannot enter or modify grades. 
                  Grade entry is restricted to teachers and school administrators.
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5" />
                    Sample Grade Data (Read-Only)
                  </CardTitle>
                  <CardDescription>
                    System-wide grade analytics - Admins have view-only access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BulkGradingTable 
                    session={mockGradingSession}
                    onSave={handleSaveGrades}
                    onSubmit={handleSubmitGrades}
                    isSubmitted={true}
                  />
                </CardContent>
              </Card>
            </div>
          ) : hasPermission(PERMISSIONS.EDIT_GRADEBOOK) ? (
            <Tabs defaultValue="bulk" className="w-full space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bulk">Bulk Entry</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="bulk">
                <BulkGradingTable 
                  session={mockGradingSession}
                  onSave={handleSaveGrades}
                  onSubmit={handleSubmitGrades}
                />
              </TabsContent>
              <TabsContent value="analytics">
                <div>Analytics Content</div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">View-Only Access</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  You do not have permission to manage grades. Contact a teacher to enter grades.
                </p>
              </div>
              
              <BulkGradingTable 
                session={mockGradingSession}
                onSave={handleSaveGrades}
                onSubmit={handleSubmitGrades}
                isSubmitted={true}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grades Modal */}
      {isModalOpen && (
        <GradesModal onClose={handleCloseModal} userRole={user?.role || 'guest'} />
      )}
      {showBulkModal && (
        <BulkGradeUploadModal
          classId={mockClassId}
          subjectId={mockSubjectId}
          term={mockTerm}
          examType={mockExamType}
          maxScore={mockMaxScore}
          students={mockStudents}
          open={showBulkModal}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </div>
  );
};

export default GradesModule;
