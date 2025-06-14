
import React, { useState } from 'react';
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
import { GradingSession } from '@/types/grading';

interface GradesModuleProps {
  
}

const GradesModule: React.FC<GradesModuleProps> = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { hasPermission } = usePermissions(user?.role as UserRole, user?.school_id);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const canManageGrades = hasPermission(PERMISSIONS.EDIT_GRADEBOOK);
  const canViewGrades = hasPermission(PERMISSIONS.VIEW_GRADEBOOK);
  const isSystemAdmin = user?.role === 'edufam_admin';

  // Early access check
  if (!canViewGrades) {
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
            Role: {user?.role} | Permission: {canViewGrades ? 'Allowed' : 'Denied'}
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

  // Mock grading session for display purposes
  const mockGradingSession: GradingSession = {
    id: 'mock-session',
    classId: 'mock-class',
    subjectId: 'mock-subject',
    term: 'Term 1',
    examType: 'MID_TERM',
    maxScore: 100,
    teacherId: 'mock-teacher',
    createdAt: new Date(),
    isActive: true,
    students: [
      {
        studentId: '1',
        name: 'John Doe',
        admissionNumber: 'ADM001',
        rollNumber: 'R001',
        currentScore: 85,
        percentage: 85,
        position: 1,
        isAbsent: false
      },
      {
        studentId: '2',
        name: 'Jane Smith',
        admissionNumber: 'ADM002',
        rollNumber: 'R002',
        currentScore: 78,
        percentage: 78,
        position: 2,
        isAbsent: false
      },
      {
        studentId: '3',
        name: 'Bob Wilson',
        admissionNumber: 'ADM003',
        rollNumber: 'R003',
        isAbsent: true
      }
    ]
  };

  const handleSaveGrades = (grades: { studentId: string; score: number; isAbsent: boolean }[]) => {
    // Mock handler - no actual saving for system admins
    console.log('Mock save grades:', grades);
  };

  const handleSubmitGrades = () => {
    // Mock handler - no actual submission for system admins
    console.log('Mock submit grades');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {isSystemAdmin ? 'System-Wide Grade Overview' : 'Grade Management'}
        </h1>
        <p className="text-muted-foreground">
          {isSystemAdmin 
            ? 'System administrator view - grade summaries across all schools'
            : 'Manage and track student grades, performance analytics, and reporting.'
          }
        </p>
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
              {isSystemAdmin ? 'Across all schools' : 'Enrolled students'}
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
              {isSystemAdmin ? 'Grade Overview (Read-Only)' : canManageGrades ? 'Manage Grades' : 'Grade Overview'}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {canManageGrades && !isSystemAdmin && (
                <>
                  <Button onClick={handleOpenModal}>
                    Open Grades Modal
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isSystemAdmin ? (
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
          ) : canManageGrades ? (
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
    </div>
  );
};

export default GradesModule;
