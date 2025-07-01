
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePrincipalGradeManagement } from '@/hooks/usePrincipalGradeManagement';
import { PrincipalGradeApprovalInterface } from '@/components/grading/PrincipalGradeApprovalInterface';
import { Eye, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface PrincipalGradesManagerProps {
  schoolId: string;
  onModalOpen?: (modalType: string) => void;
}

const PrincipalGradesManager: React.FC<PrincipalGradesManagerProps> = ({
  schoolId,
  onModalOpen
}) => {
  const {
    grades,
    isLoading,
    processing,
    handleApproveGrades,
    handleRejectGrades,
    handleReleaseGrades
  } = usePrincipalGradeManagement();

  const [activeTab, setActiveTab] = useState('pending');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  console.log('🎓 PrincipalGradesManager: Rendering with', grades.length, 'grades');

  // Filter grades based on status and filters
  const getFilteredGrades = (status: string) => {
    return grades.filter(grade => {
      const statusMatch = status === 'all' || grade.status === status;
      const classMatch = classFilter === 'all' || grade.class_id === classFilter;
      const subjectMatch = subjectFilter === 'all' || grade.subject_id === subjectFilter;
      return statusMatch && classMatch && subjectMatch;
    });
  };

  const pendingGrades = getFilteredGrades('submitted');
  const approvedGrades = getFilteredGrades('approved');
  const rejectedGrades = getFilteredGrades('rejected');

  // Get unique classes and subjects for filters
  const uniqueClasses = Array.from(new Set(grades.map(g => g.classes?.name).filter(Boolean)));
  const uniqueSubjects = Array.from(new Set(grades.map(g => g.subjects?.name).filter(Boolean)));

  const handleBulkAction = async (gradeIds: string[], action: 'approve' | 'reject' | 'release') => {
    switch (action) {
      case 'approve':
        await handleApproveGrades(gradeIds);
        break;
      case 'reject':
        await handleRejectGrades(gradeIds);
        break;
      case 'release':
        await handleReleaseGrades(gradeIds);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{pendingGrades.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedGrades.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedGrades.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map((subjectName) => (
                    <SelectItem key={subjectName} value={subjectName}>
                      {subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Review ({pendingGrades.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedGrades.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Rejected ({rejectedGrades.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PrincipalGradeApprovalInterface
            grades={pendingGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId}
            allowRelease={false}
          />
        </TabsContent>

        <TabsContent value="approved">
          <PrincipalGradeApprovalInterface
            grades={approvedGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId}
            allowRelease={true}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <PrincipalGradeApprovalInterface
            grades={rejectedGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId}
            readOnly={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrincipalGradesManager;
