import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useOptimizedGradeQuery } from "@/hooks/useOptimizedGradeQuery";
import { ImprovedGradeSheet } from "@/components/grading/ImprovedGradeSheet";
import GradesModal from "@/components/modals/GradesModal";
import { CBCGradesModal } from "@/components/modals/CBCGradesModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileSpreadsheet,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  BookOpen,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSchoolCurriculum } from "@/hooks/useSchoolCurriculum";
import { useClassCurriculum } from "@/hooks/useClassCurriculum";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { DynamicGradingSheet } from "@/components/grading/DynamicGradingSheet";

interface ClassOption {
  id: string;
  name: string;
}

const TeacherGradesManager: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const [showGradesModal, setShowGradesModal] = useState(false);
  const [showCBCModal, setShowCBCModal] = useState(false);
  const [showImprovedSheet, setShowImprovedSheet] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);

  const { curriculumType: schoolCurriculumType, loading: curriculumLoading } =
    useSchoolCurriculum();
  const {
    curriculumType: classCurriculumType,
    loading: classCurriculumLoading,
    error: classCurriculumError,
  } = useClassCurriculum(selectedClass);

  // Use class-specific curriculum if available, otherwise fall back to school curriculum
  const curriculumType = selectedClass
    ? classCurriculumType
    : schoolCurriculumType;
  const curriculumLoadingState = selectedClass
    ? classCurriculumLoading
    : curriculumLoading;

  const {
    data: grades,
    isLoading,
    refetch,
  } = useOptimizedGradeQuery({
    enabled: !!user?.id && !!schoolId,
  });

  useEffect(() => {
    loadTeacherClasses();
  }, [user?.id, schoolId]);

  const loadTeacherClasses = async () => {
    if (!user?.id || !schoolId) return;

    try {
      console.log("Loading teacher classes for:", user.id, schoolId);

      const { data, error } = await supabase
        .from("subject_teacher_assignments")
        .select(
          `
          class_id,
          classes!inner(id, name)
        `
        )
        .eq("teacher_id", user.id)
        .eq("school_id", schoolId)
        .eq("is_active", true);

      if (error) {
        console.error("Error loading teacher classes:", error);
        throw error;
      }

      const uniqueClasses =
        data
          ?.filter((item: any) => item.classes)
          .map((item: any) => ({
            id: item.classes.id,
            name: item.classes.name,
          }))
          .filter(
            (cls, index, self) =>
              index === self.findIndex((c) => c.id === cls.id)
          ) || [];

      console.log("Loaded classes:", uniqueClasses);
      setClasses(uniqueClasses);

      if (uniqueClasses.length === 0) {
        toast({
          title: "No Classes Assigned",
          description:
            "You are not assigned to any classes. Please contact your administrator.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error loading teacher classes:", error);
      toast({
        title: "Error Loading Classes",
        description: "Failed to load your assigned classes. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle cases where approval_workflow_stage might not exist, fallback to status
  const getWorkflowStage = (grade: any) =>
    grade.approval_workflow_stage || grade.status || "draft";

  const draftGrades =
    grades?.filter((grade) => getWorkflowStage(grade) === "draft") || [];
  const submittedGrades =
    grades?.filter((grade) => getWorkflowStage(grade) === "submitted") || [];
  const approvedGrades =
    grades?.filter((grade) => getWorkflowStage(grade) === "approved") || [];
  const rejectedGrades =
    grades?.filter((grade) => getWorkflowStage(grade) === "rejected") || [];
  const releasedGrades =
    grades?.filter((grade) => getWorkflowStage(grade) === "released") || [];

  const handleImprovedGrading = () => {
    if (!selectedClass || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Information",
        description: "Please select class, term, and exam type to continue",
        variant: "default",
      });
      return;
    }
    console.log("Opening grading sheet for teacher:", curriculumType);
    setShowImprovedSheet(true);
  };

  const handleSingleGrade = () => {
    console.log("Opening single grade modal for teacher");
    if (curriculumType === "cbc") {
      setShowCBCModal(true);
    } else {
      setShowGradesModal(true);
    }
  };

  const handleModalClose = () => {
    setShowGradesModal(false);
    setShowCBCModal(false);
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

  const getCurriculumBadge = () => {
    if (curriculumLoading) return null;

    switch (curriculumType) {
      case "cbc":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
            CBC Curriculum
          </Badge>
        );
      case "igcse":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
            IGCSE Curriculum
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
            Standard Curriculum
          </Badge>
        );
    }
  };

  const getAssessmentTypeOptions = () => {
    if (curriculumType === "cbc") {
      return (
        <>
          <SelectItem value="observation">Observation</SelectItem>
          <SelectItem value="written_work">Written Work</SelectItem>
          <SelectItem value="project_work">Project Work</SelectItem>
          <SelectItem value="group_activity">Group Activity</SelectItem>
          <SelectItem value="oral_assessment">Oral Assessment</SelectItem>
          <SelectItem value="practical_work">Practical Work</SelectItem>
        </>
      );
    } else {
      return (
        <>
          <SelectItem value="OPENER">Opener</SelectItem>
          <SelectItem value="MID_TERM">Mid Term</SelectItem>
          <SelectItem value="END_TERM">End Term</SelectItem>
        </>
      );
    }
  };

  if (curriculumLoadingState) {
    return (
      <Card className="h-full">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading curriculum settings...</span>
        </CardContent>
      </Card>
    );
  }

  // Show curriculum error if any
  if (classCurriculumError && selectedClass) {
    return (
      <Card className="h-full">
        <CardContent className="p-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Curriculum Error
            </h3>
            <p className="text-red-600 mb-4">{classCurriculumError}</p>
            <p className="text-sm text-gray-600">
              No curriculum type set for this class. Please update the class
              information.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Grade Management System
            </CardTitle>
            {getCurriculumBadge()}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSingleGrade}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              {curriculumType === "cbc" ? "CBC Assessment" : "Single Grade"}
            </Button>
            <Button
              size="sm"
              onClick={handleImprovedGrading}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
              disabled={!selectedClass || !selectedTerm || !selectedExamType}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {curriculumType === "cbc" ? "Assessment Sheet" : "Grade Sheet"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Class and Term Selection */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-3">
              {curriculumType === "cbc"
                ? "Assessment Configuration"
                : "Grade Sheet Configuration"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-blue-800">
                  Class
                </label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-blue-800">
                  Term
                </label>
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
                <label className="text-xs font-medium text-blue-800">
                  {curriculumType === "cbc" ? "Assessment Type" : "Exam Type"}
                </label>
                <Select
                  value={selectedExamType}
                  onValueChange={setSelectedExamType}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>{getAssessmentTypeOptions()}</SelectContent>
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
                  <p className="text-sm font-medium text-yellow-800">
                    Draft {curriculumType === "cbc" ? "Assessments" : "Grades"}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {draftGrades.length}
                  </p>
                  <p className="text-xs text-yellow-600">Need submission</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-25 border-blue-200">
                <div>
                  <p className="text-sm font-medium text-blue-800">Submitted</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {submittedGrades.length}
                  </p>
                  <p className="text-xs text-blue-600">Under review</p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Pending
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-25 border-green-200">
                <div>
                  <p className="text-sm font-medium text-green-800">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {approvedGrades.length}
                  </p>
                  <p className="text-xs text-green-600">Principal approved</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>

              {rejectedGrades.length > 0 && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-red-25 border-red-200">
                  <div>
                    <p className="text-sm font-medium text-red-800">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">
                      {rejectedGrades.length}
                    </p>
                    <p className="text-xs text-red-600">Need revision</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              )}

              {releasedGrades.length > 0 && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-purple-25 border-purple-200">
                  <div>
                    <p className="text-sm font-medium text-purple-800">
                      Released
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {releasedGrades.length}
                    </p>
                    <p className="text-xs text-purple-600">
                      Available to parents
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  {curriculumType === "cbc"
                    ? "Assessment Tools"
                    : "Grading Tools"}
                </h4>
                {getCurriculumBadge()}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="default"
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white h-12"
                  onClick={handleImprovedGrading}
                  disabled={
                    !selectedClass || !selectedTerm || !selectedExamType
                  }
                >
                  <FileSpreadsheet className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">
                      Open{" "}
                      {curriculumType === "cbc"
                        ? "Assessment Sheet"
                        : "Grade Sheet"}
                    </div>
                    <div className="text-xs opacity-90">
                      {selectedClass && selectedTerm && selectedExamType
                        ? `${selectedTerm} - ${selectedExamType}`
                        : `Select class, term & ${
                            curriculumType === "cbc" ? "assessment" : "exam"
                          } type`}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-blue-100 text-blue-800"
                  >
                    Recommended
                  </Badge>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-10"
                  onClick={handleSingleGrade}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {curriculumType === "cbc"
                    ? "Add Individual CBC Assessment"
                    : "Add Individual Grade"}
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
      {showImprovedSheet &&
        selectedClass &&
        selectedTerm &&
        selectedExamType && (
          <Dialog open={showImprovedSheet} onOpenChange={handleModalClose}>
            <DialogContent className="max-w-5xl">
              <DynamicGradingSheet
                classId={selectedClass}
                term={selectedTerm}
                examType={selectedExamType}
                onSubmissionSuccess={handleSubmissionSuccess}
              />
            </DialogContent>
          </Dialog>
        )}

      {/* Standard Grade Modal */}
      {showGradesModal && (
        <GradesModal
          onClose={() => setShowGradesModal(false)}
          userRole={user?.role || "teacher"}
        />
      )}

      {/* CBC Grade Modal */}
      {showCBCModal && (
        <CBCGradesModal onClose={() => setShowCBCModal(false)} />
      )}
    </Card>
  );
};

export default TeacherGradesManager;
