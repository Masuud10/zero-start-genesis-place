import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePrincipalGradeManagement } from '@/hooks/usePrincipalGradeManagement';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';
import { PrincipalGradeApprovalInterface } from '@/components/grading/PrincipalGradeApprovalInterface';
import { Eye, CheckCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

const PrincipalGradesModule: React.FC = () => {
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const {
    grades,
    isLoading,
    processing,
    handleApproveGrades,
    handleRejectGrades,
    handleReleaseGrades
  } = usePrincipalGradeManagement();

  const { classes } = useClasses();
  const { subjects } = useSubjects();

  const [activeTab, setActiveTab] = useState('pending');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [termFilter, setTermFilter] = useState<string>('all');
  
  const getFilteredGrades = (status: string) => {
    return grades.filter(grade => {
      const statusMatch = status === 'all' || grade.status === status;
      const classMatch = classFilter === 'all' || grade.class_id === classFilter;
      const subjectMatch = subjectFilter === 'all' || grade.subject_id === subjectFilter;
      const termMatch = termFilter === 'all' || grade.term === termFilter;
      return statusMatch && classMatch && subjectMatch && termMatch;
    });
  };

  const pendingGrades = getFilteredGrades('submitted');
  const approvedGrades = getFilteredGrades('approved');
  const rejectedGrades = getFilteredGrades('rejected');
  const releasedGrades = getFilteredGrades('released');

  const uniqueTerms = Array.from(new Set(grades.map(g => g.term).filter(Boolean)));

  const handleBulkAction = async (gradeIds: string[], action: 'approve' | 'reject' | 'release') => {
    try {
      switch (action) {
        case 'approve':
          await handleApproveGrades(gradeIds);
          toast({ title: "Success", description: `${gradeIds.length} grades approved.` });
          break;
        case 'reject':
          await handleRejectGrades(gradeIds);
          toast({ title: "Success", description: `${gradeIds.length} grades rejected.` });
          break;
        case 'release':
          await handleReleaseGrades(gradeIds);
          toast({ title: "Success", description: `${gradeIds.length} grades released.` });
          break;
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to process grades.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Grades Management</h1>
          <p className="text-muted-foreground">Approve, review, and manage student grades</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm font-medium text-muted-foreground">Released</p>
                <p className="text-2xl font-bold text-blue-600">{releasedGrades.length}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="pending">Pending ({pendingGrades.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedGrades.length})</TabsTrigger>
          <TabsTrigger value="released">Released ({releasedGrades.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedGrades.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PrincipalGradeApprovalInterface
            grades={pendingGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId || ''}
            allowRelease={false}
          />
        </TabsContent>

        <TabsContent value="approved">
          <PrincipalGradeApprovalInterface
            grades={approvedGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId || ''}
            allowRelease={true}
          />
        </TabsContent>

        <TabsContent value="released">
          <PrincipalGradeApprovalInterface
            grades={releasedGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId || ''}
            readOnly={true}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <PrincipalGradeApprovalInterface
            grades={rejectedGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId || ''}
            readOnly={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrincipalGradesModule;