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

  const gradeStats = {
    totalStudents: 1247,
    averageScore: 78.5,
    topPerformingSubject: 'Mathematics',
    studentsAbove90: 320
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Grade Management
        </h1>
        <p className="text-muted-foreground">
          Manage and track student grades, performance analytics, and reporting.
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
            <p className="text-xs text-muted-foreground">Enrolled students</p>
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
              {canManageGrades ? 'Manage Grades' : 'Grade Overview'}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {canManageGrades && (
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
          {canManageGrades ? (
            <Tabs defaultValue="bulk" className="w-full space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bulk">Bulk Entry</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="bulk">
                <BulkGradingTable />
              </TabsContent>
              <TabsContent value="analytics">
                <div>Analytics Content</div>
              </TabsContent>
            </Tabs>
          ) : (
            <div>
              <p>You do not have permission to manage grades.</p>
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
