import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useClassCurriculum } from "@/hooks/useClassCurriculum";
import { useOptimizedGradeQuery } from "@/hooks/useOptimizedGradeQuery";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCurriculumInfo } from "@/utils/curriculum-detector";
import { DynamicGradingSheet } from "@/components/grading/DynamicGradingSheet";
import BulkGradingModal from "@/components/grading/BulkGradingModal";
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
  RefreshCw,
} from "lucide-react";
import { useAcademicModuleIntegration } from "@/hooks/useAcademicModuleIntegration";

interface ClassOption {
  id: string;
  name: string;
  curriculum_type?: string;
  curriculum?: string;
}

interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

const TeacherGradesModule: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  // State management
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedExamType, setSelectedExamType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDynamicSheet, setShowDynamicSheet] = useState(false);

  // Curriculum detection
  const {
    curriculumType,
    loading: curriculumLoading,
    error: curriculumError,
    classData,
    refreshCurriculum,
  } = useClassCurriculum(selectedClass);

  // Grade data
  const {
    data: grades,
    isLoading: gradesLoading,
    refetch: refetchGrades,
  } = useOptimizedGradeQuery({
    enabled: !!user?.id && !!schoolId,
  });

  // Academic module integration
  const {
    context,
    isLoading,
    error: academicError,
    data: academicData,
    isValid,
    refreshData,
    currentPeriod,
    validation,
  } = useAcademicModuleIntegration(["grades"]);

  // Load teacher's classes
  useEffect(() => {
    if (user?.id && schoolId) {
      loadTeacherClasses();
    }
  }, [user?.id, schoolId]);

  // Load subjects when class changes
  useEffect(() => {
    if (selectedClass) {
      loadClassSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedClass]);

  const loadTeacherClasses = async () => {
    try {
      setLoading(true);
      console.log(
        "🎓 TeacherGradesModule: Loading classes for teacher:",
        user?.id
      );

      const { data, error } = await supabase
        .from("classes")
        .select("id, name, curriculum_type, curriculum")
        .eq("school_id", schoolId)
        .eq("teacher_id", user?.id)
        .order("name");

      if (error) {
        console.error("❌ Error loading classes:", error);
        toast({
          title: "Error",
          description: "Failed to load your classes.",
          variant: "destructive",
        });
        return;
      }

      console.log("✅ TeacherGradesModule: Loaded classes:", data?.length || 0);
      setClasses(data || []);
    } catch (error) {
      console.error("❌ Error in loadTeacherClasses:", error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClassSubjects = async () => {
    try {
      console.log(
        "🎓 TeacherGradesModule: Loading subjects for class:",
        selectedClass
      );

      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, code")
        .eq("class_id", selectedClass)
        .eq("teacher_id", user?.id)
        .order("name");

      if (error) {
        console.error("❌ Error loading subjects:", error);
        toast({
          title: "Error",
          description: "Failed to load subjects for this class.",
          variant: "destructive",
        });
        return;
      }

      console.log(
        "✅ TeacherGradesModule: Loaded subjects:",
        data?.length || 0
      );
      setSubjects(data || []);
    } catch (error) {
      console.error("❌ Error in loadClassSubjects:", error);
      toast({
        title: "Error",
        description: "Failed to load subjects.",
        variant: "destructive",
      });
    }
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setSelectedSubject("");
    setSelectedTerm("");
    setSelectedExamType("");
    // Refresh curriculum data
    refreshCurriculum();
  };

  const handleBulkGrading = () => {
    if (!selectedClass || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Information",
        description: "Please select class, term, and exam type to continue",
        variant: "destructive",
      });
      return;
    }
    console.log("🎓 TeacherGradesModule: Opening bulk grading modal");
    setShowBulkModal(true);
  };

  const handleDynamicSheet = () => {
    if (!selectedClass || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Information",
        description: "Please select class, term, and exam type to continue",
        variant: "destructive",
      });
      return;
    }
    console.log("🎓 TeacherGradesModule: Opening dynamic grading sheet");
    setShowDynamicSheet(true);
  };

  const handleModalClose = () => {
    setShowBulkModal(false);
    setShowDynamicSheet(false);
    refetchGrades();
  };

  const handleSubmissionSuccess = () => {
    toast({
      title: "Grades Submitted Successfully",
      description: "Your grades have been submitted for principal approval",
    });
    handleModalClose();
  };

  // Get curriculum information
  const curriculumInfo = getCurriculumInfo(curriculumType);

  // Filter grades for current selection
  const filteredGrades =
    grades?.filter((grade) => {
      if (selectedClass && grade.class_id !== selectedClass) return false;
      if (
        selectedSubject &&
        selectedSubject !== "all" &&
        grade.subject_id !== selectedSubject
      )
        return false;
      if (selectedTerm && selectedTerm !== "all" && grade.term !== selectedTerm)
        return false;
      if (
        selectedExamType &&
        selectedExamType !== "all" &&
        grade.exam_type !== selectedExamType
      )
        return false;
      return true;
    }) || [];

  // Grade statistics
  const submittedGrades = filteredGrades.filter(
    (grade) => grade.status === "submitted"
  );
  const approvedGrades = filteredGrades.filter(
    (grade) => grade.status === "approved"
  );
  const rejectedGrades = filteredGrades.filter(
    (grade) => grade.status === "rejected"
  );
  const releasedGrades = filteredGrades.filter(
    (grade) => grade.status === "released"
  );

  // Get assessment type options based on curriculum
  const getAssessmentTypeOptions = () => {
    if (curriculumType === "cbc") {
      return [
        { value: "observation", label: "Observation" },
        { value: "written_work", label: "Written Work" },
        { value: "project_work", label: "Project Work" },
        { value: "group_activity", label: "Group Activity" },
        { value: "oral_assessment", label: "Oral Assessment" },
        { value: "practical_work", label: "Practical Work" },
      ];
    } else {
      return [
        { value: "OPENER", label: "Opener" },
        { value: "MID_TERM", label: "Mid Term" },
        { value: "END_TERM", label: "End Term" },
        { value: "CAT", label: "CAT" },
        { value: "ASSIGNMENT", label: "Assignment" },
        { value: "PROJECT", label: "Project" },
        { value: "EXAM", label: "Exam" },
      ];
    }
  };

  // Note: academicData contains grades, examinations, attendance, reports, and analytics
  // Classes and subjects are loaded separately via loadTeacherClasses and loadClassSubjects

  if (curriculumLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading curriculum settings...</span>
        </CardContent>
      </Card>
    );
  }

  if (curriculumError && selectedClass) {
    return (
      <Card className="h-full">
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Curriculum Error</AlertTitle>
            <AlertDescription>
              {curriculumError}
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshCurriculum}
                  className="mr-2"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedClass("")}
                >
                  Select Different Class
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Class Grades
              </CardTitle>
              {curriculumInfo && (
                <Badge className={curriculumInfo.badgeColor}>
                  {curriculumInfo.displayName}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={loadTeacherClasses}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Panel */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <h4 className="font-medium text-blue-900 mb-4">
            {curriculumType === "cbc"
              ? "Assessment Configuration"
              : "Grade Sheet Configuration"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Class Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-800">Class</label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      <div className="flex items-center gap-2">
                        <span>{cls.name}</span>
                        {cls.curriculum_type && (
                          <Badge variant="outline" className="text-xs">
                            {cls.curriculum_type.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-800">
                Subject
              </label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Term Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-800">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Exam Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-800">
                {curriculumType === "cbc" ? "Assessment Type" : "Exam Type"}
              </label>
              <Select
                value={selectedExamType}
                onValueChange={setSelectedExamType}
              >
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {getAssessmentTypeOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="default"
          className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white h-16"
          onClick={handleBulkGrading}
          disabled={!selectedClass || !selectedTerm || !selectedExamType}
        >
          <FileSpreadsheet className="h-6 w-6 mr-3" />
          <div className="text-left">
            <div className="font-medium">
              Open{" "}
              {curriculumType === "cbc" ? "Assessment Sheet" : "Grade Sheet"}
            </div>
            <div className="text-sm opacity-90">
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
          className="w-full justify-start h-16"
          onClick={handleDynamicSheet}
          disabled={!selectedClass || !selectedTerm || !selectedExamType}
        >
          <TrendingUp className="h-6 w-6 mr-3" />
          <div className="text-left">
            <div className="font-medium">Dynamic Grading Sheet</div>
            <div className="text-sm opacity-90">
              Advanced grading with real-time validation
            </div>
          </div>
        </Button>
      </div>

      {/* Grade Statistics */}
      {filteredGrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Grade Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {submittedGrades.length}
                </div>
                <div className="text-sm text-blue-800">Submitted</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {approvedGrades.length}
                </div>
                <div className="text-sm text-green-800">Approved</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {rejectedGrades.length}
                </div>
                <div className="text-sm text-red-800">Rejected</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {releasedGrades.length}
                </div>
                <div className="text-sm text-purple-800">Released</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {classes.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Classes Assigned
            </h3>
            <p className="text-gray-600 mb-4">
              You don't have any classes assigned to you yet. Please contact
              your administrator.
            </p>
            <Button onClick={loadTeacherClasses} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showBulkModal && (
        <BulkGradingModal
          open={showBulkModal}
          onClose={handleModalClose}
          classList={classes}
          subjectList={subjects}
        />
      )}

      {showDynamicSheet && (
        <DynamicGradingSheet
          classId={selectedClass}
          term={selectedTerm}
          examType={selectedExamType}
          onSubmissionSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};

export default TeacherGradesModule;
