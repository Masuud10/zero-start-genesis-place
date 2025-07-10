import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Target, Save, Send, Loader2 } from "lucide-react";
import { useCBCData } from "@/hooks/useCBCData";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CBCGradeValue, CBC_PERFORMANCE_LEVELS } from "@/types/cbc";

interface ComprehensiveCBCGradingSheetProps {
  classId: string;
  subjectId: string;
  term: string;
  academicYear: string;
  students: Array<{
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  }>;
  isReadOnly?: boolean;
  isPrincipal?: boolean;
  onSave?: () => void;
  onSubmit?: () => void;
}

export const ComprehensiveCBCGradingSheet: React.FC<
  ComprehensiveCBCGradingSheetProps
> = ({
  classId,
  subjectId,
  term,
  academicYear,
  students,
  isReadOnly = false,
  isPrincipal = false,
  onSave,
  onSubmit,
}) => {
  const { schoolId } = useSchoolScopedData();
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [selectedStrand, setSelectedStrand] = useState<string>("");
  const [selectedAssessmentType, setSelectedAssessmentType] =
    useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    useCBCLearningAreas,
    useCBCPerformanceDescriptors,
    useCBCGrades,
    useCBCStrandAssessments,
    useCBCPerformanceSummary,
    useCBCCompetencies,
  } = useCBCData();

  // Data fetching
  const { data: learningAreas = [], isLoading: learningAreasLoading } =
    useCBCLearningAreas(subjectId, classId);

  // Default learning areas if none are available
  const defaultLearningAreas = [
    { id: "mathematics", learning_area_name: "Mathematics" },
    { id: "english", learning_area_name: "English" },
    { id: "kiswahili", learning_area_name: "Kiswahili" },
    { id: "science", learning_area_name: "Science" },
    { id: "social_studies", learning_area_name: "Social Studies" },
    { id: "creative_arts", learning_area_name: "Creative Arts" },
    { id: "physical_education", learning_area_name: "Physical Education" },
    { id: "religious_education", learning_area_name: "Religious Education" },
    { id: "life_skills", learning_area_name: "Life Skills" },
    { id: "ict", learning_area_name: "ICT" },
  ];

  // Use default learning areas if no data is available
  const availableLearningAreas =
    learningAreas.length > 0 ? learningAreas : defaultLearningAreas;
  const { data: performanceDescriptors = [], isLoading: descriptorsLoading } =
    useCBCPerformanceDescriptors(selectedStrand);
  const { data: competencies = [], isLoading: competenciesLoading } =
    useCBCCompetencies(subjectId, classId);
  const { data: grades = [], isLoading: gradesLoading } = useCBCGrades(
    classId,
    subjectId,
    term,
    academicYear
  );
  const { data: strandAssessments = [], isLoading: strandAssessmentsLoading } =
    useCBCStrandAssessments(classId, subjectId, term, academicYear);
  const { data: performanceSummary = [], isLoading: summaryLoading } =
    useCBCPerformanceSummary(classId, subjectId, term, academicYear);

  // Mutations
  const createGrade = useCBCData().useCreateCBCGrade();
  const updateGrade = useCBCData().useUpdateCBCGrade();
  const createStrandAssessment = useCBCData().useCreateCBCStrandAssessment();

  // Local state for grading data
  const [gradingData, setGradingData] = useState<Record<string, CBCGradeValue>>(
    {}
  );

  // Initialize grading data from existing assessments
  useEffect(() => {
    if (grades.length > 0 || strandAssessments.length > 0) {
      const initialData: Record<string, CBCGradeValue> = {};

      // Process grades
      grades.forEach((grade) => {
        const key = `${grade.student_id}_${grade.learning_area_id}_none`;
        initialData[key] = {
          performance_level: grade.performance_level,
          strand_scores: {},
          sub_strand_scores: {},
          learning_outcome_scores: {},
          teacher_remarks: grade.teacher_remarks || "",
          evidence_description: "",
          areas_of_strength: [],
          areas_for_improvement: [],
          next_steps: "",
          assessment_type: "general",
        };
      });

      // Process strand assessments
      strandAssessments.forEach((assessment) => {
        const key = `${assessment.student_id}_${assessment.strand_name}_${
          assessment.sub_strand_name || "none"
        }`;
        initialData[key] = {
          performance_level: assessment.performance_level,
          strand_scores: {},
          sub_strand_scores: {},
          learning_outcome_scores: {},
          teacher_remarks: assessment.teacher_remarks || "",
          evidence_description: "",
          areas_of_strength: [],
          areas_for_improvement: [],
          next_steps: "",
          assessment_type: assessment.assessment_type,
        };
      });

      setGradingData(initialData);
    }
  }, [grades, strandAssessments]);

  // Handle grade changes
  const handleGradeChange = (
    studentId: string,
    strandId: string,
    subStrandId: string,
    field: string,
    value: string | string[] | Record<string, unknown> | number
  ) => {
    const key = `${studentId}_${strandId}_${subStrandId || "none"}`;
    const currentData = gradingData[key] || {
      performance_level: "EM",
      strand_scores: {},
      sub_strand_scores: {},
      learning_outcome_scores: {},
      teacher_remarks: "",
      evidence_description: "",
      areas_of_strength: [],
      areas_for_improvement: [],
      next_steps: "",
      assessment_type: selectedAssessmentType,
    };

    setGradingData({
      ...gradingData,
      [key]: {
        ...currentData,
        [field]: value,
      },
    });
  };

  // Save all grades
  const handleSaveGrades = async () => {
    if (!user || !schoolId) return;

    setIsSaving(true);
    try {
      const promises = Object.entries(gradingData).map(
        async ([key, gradeData]) => {
          const [studentId, strandId, subStrandId] = key.split("_");

          // Check if assessment already exists in strandAssessments
          const existingAssessment = strandAssessments.find(
            (sa) =>
              sa.student_id === studentId &&
              sa.strand_name === strandId &&
              sa.sub_strand_name ===
                (subStrandId === "none" ? null : subStrandId)
          );

          if (existingAssessment) {
            // Update existing assessment using createStrandAssessment (upsert)
            return createStrandAssessment.mutateAsync({
              student_id: studentId,
              class_id: classId,
              subject_id: subjectId,
              strand_name: strandId,
              sub_strand_name: subStrandId === "none" ? undefined : subStrandId,
              assessment_type: gradeData.assessment_type || "observation",
              performance_level: gradeData.performance_level,
              teacher_remarks: gradeData.teacher_remarks,
              term,
              academic_year: academicYear,
            });
          } else {
            // Create new assessment
            return createStrandAssessment.mutateAsync({
              student_id: studentId,
              class_id: classId,
              subject_id: subjectId,
              strand_name: strandId,
              sub_strand_name: subStrandId === "none" ? undefined : subStrandId,
              assessment_type: gradeData.assessment_type || "observation",
              performance_level: gradeData.performance_level,
              teacher_remarks: gradeData.teacher_remarks,
              term,
              academic_year: academicYear,
            });
          }
        }
      );

      await Promise.all(promises);

      toast({
        title: "Success",
        description: "All grades saved successfully",
      });

      onSave?.();
    } catch (error) {
      console.error("Error saving grades:", error);
      toast({
        title: "Error",
        description: "Failed to save grades. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Submit grades for approval
  const handleSubmitGrades = async () => {
    if (!user || !schoolId) return;

    setIsSubmitting(true);
    try {
      // First save all grades
      await handleSaveGrades();

      // For now, just show success message since we don't have a submit mutation
      toast({
        title: "Success",
        description:
          "Grades saved successfully. Submit functionality will be implemented soon.",
      });

      onSubmit?.();
    } catch (error) {
      console.error("Error submitting grades:", error);
      toast({
        title: "Error",
        description: "Failed to submit grades. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get performance level info
  const getPerformanceLevelInfo = (level: string) => {
    return CBC_PERFORMANCE_LEVELS.find((l) => l.level_code === level);
  };

  // Loading state
  if (
    learningAreasLoading ||
    descriptorsLoading ||
    competenciesLoading ||
    gradesLoading ||
    strandAssessmentsLoading ||
    summaryLoading
  ) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading CBC grading data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-green-800">
            <Target className="w-6 h-6" />
            CBC Competency-Based Grading Sheet
          </CardTitle>
          <CardDescription className="text-green-700">
            Term: {term} | Academic Year: {academicYear} | Students:{" "}
            {students.length}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Grading Interface */}
      <Card>
        <CardHeader>
          <CardTitle>CBC Grading</CardTitle>
          <CardDescription>
            Enter marks and performance levels for each student
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Assessment Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Learning Area</label>
              <Select value={selectedStrand} onValueChange={setSelectedStrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a learning area" />
                </SelectTrigger>
                <SelectContent>
                  {availableLearningAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.learning_area_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Assessment Type</label>
              <Select
                value={selectedAssessmentType}
                onValueChange={setSelectedAssessmentType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assessment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="observation">Observation</SelectItem>
                  <SelectItem value="written_work">Written Work</SelectItem>
                  <SelectItem value="project_work">Project Work</SelectItem>
                  <SelectItem value="group_activity">Group Activity</SelectItem>
                  <SelectItem value="oral_assessment">
                    Oral Assessment
                  </SelectItem>
                  <SelectItem value="practical_work">Practical Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Performance Level Guide */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium mb-2">
              Performance Level Guide:
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {CBC_PERFORMANCE_LEVELS.map((level) => (
                <div key={level.level_code} className="flex items-center gap-1">
                  <Badge className="text-xs">{level.level_code}</Badge>
                  <span className="text-gray-600">{level.level_name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grading Table */}
          {selectedStrand && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Marks (0-100)</TableHead>
                    <TableHead>Performance Level</TableHead>
                    <TableHead>Teacher Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const key = `${student.id}_${selectedStrand}_none`;
                    const gradeData = gradingData[key] || {
                      performance_level: "EM",
                      marks: 0,
                      strand_scores: {},
                      sub_strand_scores: {},
                      learning_outcome_scores: {},
                      teacher_remarks: "",
                      evidence_description: "",
                      areas_of_strength: [],
                      areas_for_improvement: [],
                      next_steps: "",
                      assessment_type: selectedAssessmentType,
                    };

                    // Function to convert marks to performance level
                    const getPerformanceLevelFromMarks = (marks: number) => {
                      if (marks >= 80) return "AD"; // Advanced
                      if (marks >= 60) return "PR"; // Proficient
                      if (marks >= 40) return "AP"; // Approaching
                      return "EM"; // Emerging
                    };

                    // Function to get performance level color
                    const getPerformanceLevelColor = (level: string) => {
                      switch (level) {
                        case "AD":
                          return "bg-green-100 text-green-800";
                        case "PR":
                          return "bg-blue-100 text-blue-800";
                        case "AP":
                          return "bg-yellow-100 text-yellow-800";
                        case "EM":
                          return "bg-red-100 text-red-800";
                        default:
                          return "bg-gray-100 text-gray-800";
                      }
                    };

                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.admission_number}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={gradeData.marks || 0}
                            onChange={(e) => {
                              const marks = parseInt(e.target.value) || 0;
                              const performanceLevel =
                                getPerformanceLevelFromMarks(marks);
                              handleGradeChange(
                                student.id,
                                selectedStrand,
                                "none",
                                "marks",
                                marks
                              );
                              handleGradeChange(
                                student.id,
                                selectedStrand,
                                "none",
                                "performance_level",
                                performanceLevel
                              );
                            }}
                            disabled={isReadOnly}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPerformanceLevelColor(
                              gradeData.performance_level
                            )}
                          >
                            {gradeData.performance_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={gradeData.teacher_remarks || ""}
                            onChange={(e) =>
                              handleGradeChange(
                                student.id,
                                selectedStrand,
                                "none",
                                "teacher_remarks",
                                e.target.value
                              )
                            }
                            placeholder="Teacher remarks..."
                            disabled={isReadOnly}
                            className="min-h-[60px]"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Action Buttons */}
          {!isReadOnly && (
            <div className="flex gap-4 justify-end">
              <Button
                onClick={handleSaveGrades}
                disabled={isSaving}
                variant="outline"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Draft
              </Button>
              <Button onClick={handleSubmitGrades} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit for Approval
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
