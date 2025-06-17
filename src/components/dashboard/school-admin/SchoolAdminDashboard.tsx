
import React from 'react';
import { AuthUser } from '@/types/auth';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useCurrentAcademicInfo } from '@/hooks/useCurrentAcademicInfo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  TrendingUp,
  School,
  UserPlus,
  Settings
} from 'lucide-react';

interface SchoolAdminDashboardProps {
  user?: AuthUser;
  onModalOpen?: (modalType: string) => void;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ user, onModalOpen }) => {
  console.log('🏫 SchoolAdminDashboard: Rendering for school admin:', user?.email, 'Role:', user?.role);

  const { schoolId } = useSchoolScopedData();
  const { academicInfo, loading } = useCurrentAcademicInfo(schoolId);

  // Mock stats for now - these should be replaced with actual data hooks
  const stats = {
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalClasses: 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            School Administration
          </h1>
          <p className="text-muted-foreground">Manage your school operations and view analytics</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {academicInfo.term} - {academicInfo.year}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Students</p>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Teachers</p>
                <p className="text-3xl font-bold">{stats.totalTeachers}</p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Subjects</p>
                <p className="text-3xl font-bold">{stats.totalSubjects}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Total Classes</p>
                <p className="text-3xl font-bold">{stats.totalClasses}</p>
              </div>
              <School className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => onModalOpen?.('studentAdmission')}
            >
              <UserPlus className="h-4 w-4" />
              Add Student
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => onModalOpen?.('teacherAdmission')}
            >
              <UserPlus className="h-4 w-4" />
              Add Teacher
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => onModalOpen?.('addClass')}
            >
              <School className="h-4 w-4" />
              Add Class
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => onModalOpen?.('addSubject')}
            >
              <BookOpen className="h-4 w-4" />
              Add Subject
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Academic Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Current Academic Term</h3>
                <p className="text-sm text-muted-foreground">{academicInfo.term} - {academicInfo.year}</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">85%</div>
                <div className="text-sm text-muted-foreground">Average Performance</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">92%</div>
                <div className="text-sm text-muted-foreground">Attendance Rate</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">78%</div>
                <div className="text-sm text-muted-foreground">Fee Collection</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminDashboard;
