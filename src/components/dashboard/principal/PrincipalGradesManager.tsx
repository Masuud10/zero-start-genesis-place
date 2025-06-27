
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Send, Eye, FileText, AlertCircle } from 'lucide-react';
import { usePrincipalGradeManagement } from '@/hooks/usePrincipalGradeManagement';
import { PrincipalGradeApprovalInterface } from '@/components/grading/PrincipalGradeApprovalInterface';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PrincipalGradesManagerProps {
  schoolId: string;
  onModalOpen?: (modalType: string) => void;
}

const PrincipalGradesManager: React.FC<PrincipalGradesManagerProps> = ({ 
  schoolId, 
  onModalOpen 
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  
  const {
    grades,
    isLoading,
    error,
    processing,
    refetch,
    handleApproveGrades,
    handleRejectGrades,
    handleReleaseGrades
  } = usePrincipalGradeManagement();

  // Enhanced error handling with school context validation
  if (!schoolId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No school context available. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    console.error('❌ PrincipalGradesManager: Error loading grades:', error);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load grades: {error.message || 'Unknown error'}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch} 
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Filter grades by status for tabs
  const pendingGrades = grades?.filter(g => g.status === 'submitted') || [];
  const approvedGrades = grades?.filter(g => g.status === 'approved') || [];
  const releasedGrades = grades?.filter(g => g.status === 'released') || [];
  const rejectedGrades = grades?.filter(g => g.status === 'rejected') || [];

  const handleBulkAction = async (gradeIds: string[], action: 'approve' | 'reject' | 'release') => {
    if (gradeIds.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select grades to perform this action.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(`🔄 PrincipalGradesManager: Performing ${action} on ${gradeIds.length} grades`);
      
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
      
      console.log(`✅ PrincipalGradesManager: ${action} completed successfully`);
      await refetch();
    } catch (error: any) {
      console.error(`❌ PrincipalGradesManager: ${action} failed:`, error);
      toast({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Failed`,
        description: error.message || `Failed to ${action} grades`,
        variant: "destructive"
      });
    }
  };

  const handleGenerateReports = () => {
    console.log('📊 PrincipalGradesManager: Opening report generator');
    if (onModalOpen) {
      onModalOpen('reports');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading grades...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Grade Management</h3>
          <p className="text-sm text-muted-foreground">
            Review, approve, and release student grades
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateReports}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Generate Reports
          </Button>
          <Button
            variant="outline"
            onClick={refetch}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Pending ({pendingGrades.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedGrades.length})
          </TabsTrigger>
          <TabsTrigger value="released" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Released ({releasedGrades.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Rejected ({rejectedGrades.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Grades Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingGrades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No grades pending approval</p>
                </div>
              ) : (
                <PrincipalGradeApprovalInterface
                  grades={pendingGrades}
                  onBulkAction={handleBulkAction}
                  processing={processing}
                  schoolId={schoolId}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Approved Grades</CardTitle>
            </CardHeader>
            <CardContent>
              {approvedGrades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No approved grades</p>
                </div>
              ) : (
                <PrincipalGradeApprovalInterface
                  grades={approvedGrades}
                  onBulkAction={handleBulkAction}
                  processing={processing}
                  schoolId={schoolId}
                  allowRelease={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="released" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Released Grades</CardTitle>
            </CardHeader>
            <CardContent>
              {releasedGrades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No grades have been released yet</p>
                </div>
              ) : (
                <PrincipalGradeApprovalInterface
                  grades={releasedGrades}
                  onBulkAction={handleBulkAction}
                  processing={processing}
                  schoolId={schoolId}
                  readOnly={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Grades</CardTitle>
            </CardHeader>
            <CardContent>
              {rejectedGrades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rejected grades</p>
                </div>
              ) : (
                <PrincipalGradeApprovalInterface
                  grades={rejectedGrades}
                  onBulkAction={handleBulkAction}
                  processing={processing}
                  schoolId={schoolId}
                  readOnly={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrincipalGradesManager;
