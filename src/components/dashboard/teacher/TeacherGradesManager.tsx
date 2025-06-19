
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useOptimizedGradeQuery } from '@/hooks/useOptimizedGradeQuery';
import BulkGradingModal from '@/components/grading/BulkGradingModal';
import GradesModal from '@/components/modals/GradesModal';
import { FileSpreadsheet, Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TeacherGradesManager: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showGradesModal, setShowGradesModal] = useState(false);

  const { data: grades, isLoading, refetch } = useOptimizedGradeQuery({
    enabled: !!user?.id && !!schoolId
  });

  const pendingGrades = grades?.filter(grade => grade.status === 'draft') || [];
  const submittedGrades = grades?.filter(grade => grade.status === 'submitted') || [];
  const approvedGrades = grades?.filter(grade => grade.status === 'approved') || [];
  const rejectedGrades = grades?.filter(grade => grade.status === 'rejected') || [];

  const handleBulkGrading = () => {
    setShowBulkModal(true);
  };

  const handleSingleGrade = () => {
    setShowGradesModal(true);
  };

  const handleModalClose = () => {
    setShowBulkModal(false);
    setShowGradesModal(false);
    // Refresh grades data
    refetch();
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Grade Management
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleSingleGrade}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Grade
            </Button>
            <Button 
              size="sm"
              onClick={handleBulkGrading}
            >
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Bulk Entry
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading grades...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200">
                <div>
                  <p className="text-sm font-medium text-orange-800">Draft Grades</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingGrades.length}</p>
                  <p className="text-xs text-orange-600">Ready to submit</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
                <div>
                  <p className="text-sm font-medium text-blue-800">Submitted</p>
                  <p className="text-2xl font-bold text-blue-600">{submittedGrades.length}</p>
                  <p className="text-xs text-blue-600">Awaiting approval</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Pending
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                <div>
                  <p className="text-sm font-medium text-green-800">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedGrades.length}</p>
                  <p className="text-xs text-green-600">Principal approved</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>

              {rejectedGrades.length > 0 && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200">
                  <div>
                    <p className="text-sm font-medium text-red-800">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{rejectedGrades.length}</p>
                    <p className="text-xs text-red-600">Need revision</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleBulkGrading}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Open Bulk Grading Sheet
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleSingleGrade}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Individual Grade
                </Button>
              </div>
            </div>

            {/* Status Messages */}
            {pendingGrades.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    You have {pendingGrades.length} draft grades ready for submission.
                  </span>
                </div>
              </div>
            )}

            {submittedGrades.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    {submittedGrades.length} grades submitted and awaiting principal approval.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Modals */}
      {showBulkModal && (
        <BulkGradingModal 
          open={showBulkModal}
          onClose={handleModalClose}
          classList={[]}
          subjectList={[]}
        />
      )}

      {showGradesModal && (
        <GradesModal 
          onClose={handleModalClose} 
          userRole={user?.role || 'teacher'} 
        />
      )}
    </Card>
  );
};

export default TeacherGradesManager;
