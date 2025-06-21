
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useOptimizedGradeQuery } from '@/hooks/useOptimizedGradeQuery';
import { ImprovedGradeSheet } from '@/components/grading/ImprovedGradeSheet';
import GradesModal from '@/components/modals/GradesModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Plus, CheckCircle, Clock, AlertTriangle, Users, BookOpen, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface ClassOption {
  id: string;
  name: string;
}

const TeacherGradesManager: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [showGradesModal, setShowGradesModal] = useState(false);
  const [showImprovedSheet, setShowImprovedSheet] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: grades, isLoading, refetch } = useOptimizedGradeQuery({
    enabled: !!user?.id && !!schoolId
  });

  useEffect(() => {
    loadTeacherClasses();
  }, [user?.id, schoolId]);

  const loadTeacherClasses = async () => {
    if (!user?.id || !schoolId) return;

    try {
      console.log('Loading teacher classes for:', user.id, schoolId);

      const { data, error } = await supabase
        .from('subject_teacher_assignments')
        .select(`
          class_id,
          classes!inner(id, name)
        `)
        .eq('teacher_id', user.id)
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (error) {
        console.error('Error loading teacher classes:', error);
        throw error;
      }

      const uniqueClasses = data
        ?.filter((item: any) => item.classes)
        .map((item: any) => ({
          id: item.classes.id,
          name: item.classes.name
        }))
        .filter((cls, index, self) => 
          index === self.findIndex(c => c.id === cls.id)
        ) || [];

      console.log('Loaded classes:', uniqueClasses);
      setClasses(uniqueClasses);

      if (uniqueClasses.length === 0) {
        toast({
          title: "No Classes Assigned",
          description: "You are not assigned to any classes. Please contact your administrator.",
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Error loading teacher classes:', error);
      toast({
        title: "Error Loading Classes",
        description: "Failed to load your assigned classes. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle cases where approval_workflow_stage might not exist, fallback to status
  const getWorkflowStage = (grade: any) => grade.approval_workflow_stage || grade.status || 'draft';
  
  const draftGrades = grades?.filter(grade => getWorkflowStage(grade) === 'draft') || [];
  const submittedGrades = grades?.filter(grade => getWorkflowStage(grade) === 'submitted') || [];
  const approvedGrades = grades?.filter(grade => getWorkflowStage(grade) === 'approved') || [];
  const rejectedGrades = grades?.filter(grade => getWorkflowStage(grade) === 'rejected') || [];
  const releasedGrades = grades?.filter(grade => getWorkflowStage(grade) === 'released') || [];

  const handleImprovedGrading = () => {
    if (!selectedClass || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Information",
        description: "Please select class, term, and exam type to continue",
        variant: "default"
      });
      return;
    }
    console.log('Opening improved grading sheet for teacher');
    setShowImprovedSheet(true);
  };

  const handleSingleGrade = () => {
    console.log('Opening single grade modal for teacher');
    setShowGradesModal(true);
  };

  const handleModalClose = () => {
    setShowGradesModal(false);
    setShowImprovedSheet(false);
    // Refresh grades data
    refetch();
  };

  const handleSubmissionSuccess = () => {
    toast({
      title: "Grades Submitted Successfully",
      description: "Your grades have been submitted for principal approval",
    });
    handleModalClose();
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Grade Management System
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
              onClick={handleImprovedGrading}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Grade Sheet
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Class and Term Selection */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-3">Grade Sheet Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-blue-800">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-blue-800">Term</label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-blue-800">Exam Type</label>
                <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPENER">Opener</SelectItem>
                    <SelectItem value="MID_TERM">Mid Term</SelectItem>
                    <SelectItem value="END_TERM">End Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading grades...</p>
          </div>
        ) : (
          <>
            {/* Status Overview Cards */}
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

            {/* Quick Actions */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Grading Tools</h4>
                <Badge variant="outline" className="text-xs">
                  Multi-Curriculum Support
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="default" 
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white h-12"
                  onClick={handleImprovedGrading}
                  disabled={!selectedClass || !selectedTerm || !selectedExamType}
                >
                  <FileSpreadsheet className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Open Grade Sheet</div>
                    <div className="text-xs opacity-90">
                      {selectedClass && selectedTerm && selectedExamType 
                        ? `${selectedTerm} - ${selectedExamType}` 
                        : 'Select class, term & exam type'}
                    </div>
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
          </>
        )}
      </CardContent>

      {/* Improved Grade Sheet Dialog */}
      <Dialog open={showImprovedSheet} onOpenChange={setShowImprovedSheet}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grade Sheet - {classes.find(c => c.id === selectedClass)?.name}</DialogTitle>
          </DialogHeader>
          {showImprovedSheet && (
            <ImprovedGradeSheet
              classId={selectedClass}
              term={selectedTerm}
              examType={selectedExamType}
              onSubmissionSuccess={handleSubmissionSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Single Grade Modal */}
      {showGradesModal && (
        <GradesModal 
          onClose={() => setShowGradesModal(false)} 
          userRole={user.role} 
        />
      )}
    </Card>
  );
};

export default TeacherGradesManager;
