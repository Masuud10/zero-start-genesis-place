
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useOptimizedGradeQuery } from '@/hooks/useOptimizedGradeQuery';
import { EnhancedBulkGradingModal } from '@/components/grading/EnhancedBulkGradingModal';
import GradesModal from '@/components/modals/GradesModal';
import { FileSpreadsheet, Plus, CheckCircle, Clock, AlertTriangle, Users, BookOpen, TrendingUp } from 'lucide-react';
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

  const draftGrades = grades?.filter(grade => grade.approval_workflow_stage === 'draft') || [];
  const submittedGrades = grades?.filter(grade => grade.approval_workflow_stage === 'submitted') || [];
  const approvedGrades = grades?.filter(grade => grade.approval_workflow_stage === 'approved') || [];
  const rejectedGrades = grades?.filter(grade => grade.approval_workflow_stage === 'rejected') || [];
  const releasedGrades = grades?.filter(grade => grade.approval_workflow_stage === 'released') || [];

  const handleEnhancedGrading = () => {
    console.log('Opening enhanced bulk grading modal for teacher');
    setShowBulkModal(true);
  };

  const handleSingleGrade = () => {
    console.log('Opening single grade modal for teacher');
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
            <TrendingUp className="h-5 w-5" />
            Enhanced Grade Management
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleSingleGrade}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Single Grade
            </Button>
            <Button 
              size="sm"
              onClick={handleEnhancedGrading}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Enhanced Grade Sheet
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading grades...</p>
          </div>
        ) : (
          <>
            {/* Enhanced Status Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-25 border-yellow-200">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Draft Grades</p>
                  <p className="text-2xl font-bold text-yellow-600">{draftGrades.length}</p>
                  <p className="text-xs text-yellow-600">Need submission</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-25 border-blue-200">
                <div>
                  <p className="text-sm font-medium text-blue-800">Submitted</p>
                  <p className="text-2xl font-bold text-blue-600">{submittedGrades.length}</p>
                  <p className="text-xs text-blue-600">Under review</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Pending
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-25 border-green-200">
                <div>
                  <p className="text-sm font-medium text-green-800">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedGrades.length}</p>
                  <p className="text-xs text-green-600">Principal approved</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>

              {rejectedGrades.length > 0 && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-red-25 border-red-200">
                  <div>
                    <p className="text-sm font-medium text-red-800">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{rejectedGrades.length}</p>
                    <p className="text-xs text-red-600">Need revision</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              )}

              {releasedGrades.length > 0 && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-purple-25 border-purple-200">
                  <div>
                    <p className="text-sm font-medium text-purple-800">Released</p>
                    <p className="text-2xl font-bold text-purple-600">{releasedGrades.length}</p>
                    <p className="text-xs text-purple-600">Available to parents</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
              )}
            </div>

            {/* Enhanced Quick Actions */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Enhanced Grading Tools</h4>
                <Badge variant="outline" className="text-xs">
                  Multi-Curriculum Support
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="default" 
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white h-12"
                  onClick={handleEnhancedGrading}
                >
                  <FileSpreadsheet className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Enhanced Grade Sheet</div>
                    <div className="text-xs opacity-90">CBC, IGCSE & Standard curriculum support</div>
                  </div>
                  <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
                    Recommended
                  </Badge>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-10"
                  onClick={handleSingleGrade}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Individual Grade
                  <Badge variant="secondary" className="ml-auto">
                    Single Entry
                  </Badge>
                </Button>
              </div>
            </div>

            {/* Enhanced Teacher Instructions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900 mb-2">Enhanced Grading Features</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Multi-Curriculum:</strong> Supports CBC competency-based, IGCSE, and standard grading</li>
                    <li>• <strong>Smart Calculations:</strong> Automatic positioning, grade boundaries, and competency levels</li>
                    <li>• <strong>Workflow Management:</strong> Draft → Submit → Principal Review → Release</li>
                    <li>• <strong>Audit Trail:</strong> Complete history of changes and approvals</li>
                    <li>• <strong>Batch Processing:</strong> Grade entire classes efficiently</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Workflow Status Messages */}
            {draftGrades.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    You have {draftGrades.length} draft grades ready for submission.
                  </span>
                </div>
              </div>
            )}

            {submittedGrades.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    {submittedGrades.length} grades submitted and awaiting principal review.
                  </span>
                </div>
              </div>
            )}

            {rejectedGrades.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">
                    {rejectedGrades.length} grades were rejected and need revision.
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Enhanced Modals */}
      {showBulkModal && (
        <EnhancedBulkGradingModal 
          open={showBulkModal}
          onClose={handleModalClose}
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
