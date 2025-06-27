
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Send, AlertCircle } from 'lucide-react';
import { usePrincipalGradeManagement } from '@/hooks/usePrincipalGradeManagement';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GradeManagerHeader } from './grades/GradeManagerHeader';
import { PendingGradesTab } from './grades/PendingGradesTab';
import { ApprovedGradesTab } from './grades/ApprovedGradesTab';
import { ReleasedGradesTab } from './grades/ReleasedGradesTab';
import { RejectedGradesTab } from './grades/RejectedGradesTab';

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
            onClick={() => refetch()} 
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

  const handleRefresh = () => {
    refetch();
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
      <GradeManagerHeader
        onGenerateReports={handleGenerateReports}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

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
          <PendingGradesTab
            grades={pendingGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId}
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <ApprovedGradesTab
            grades={approvedGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId}
          />
        </TabsContent>

        <TabsContent value="released" className="mt-6">
          <ReleasedGradesTab
            grades={releasedGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId}
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <RejectedGradesTab
            grades={rejectedGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrincipalGradesManager;
