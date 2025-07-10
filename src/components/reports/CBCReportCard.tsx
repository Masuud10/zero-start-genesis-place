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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Download,
  Printer,
  Eye,
  FileText,
  Target,
  TrendingUp,
  Award,
  Calendar,
  User,
  School,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
} from "lucide-react";
import { useCBCData } from "@/hooks/useCBCData";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";
import {
  CBCStrand,
  CBCSubStrand,
  CBCStudentAssessment,
  CBCTermSummary,
  CBCPerformanceLevel,
  CBCReportCardData,
  CBC_PERFORMANCE_LEVELS,
} from "@/types/cbc";

// Type for assessment data that can come from different sources
type AssessmentData = CBCStudentAssessment & {
  strand_name?: string;
  learning_area?: {
    learning_area_name?: string;
  };
};

interface CBCReportCardProps {
  studentId: string;
  classId: string;
  term: string;
  academicYear: string;
  isPreview?: boolean;
  onPrint?: () => void;
  onDownload?: () => void;
}

export const CBCReportCard: React.FC<CBCReportCardProps> = ({
  studentId,
  classId,
  term,
  academicYear,
  isPreview = false,
  onPrint,
  onDownload,
}) => {
  const { schoolId } = useSchoolScopedData();
  const [reportData, setReportData] = useState<CBCReportCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullReport, setShowFullReport] = useState(false);

  // Data fetching - using available hooks
  const { data: strandAssessments = [] } = useCBCData().useCBCStrandAssessments(
    classId,
    undefined,
    term,
    academicYear
  );
  const { data: grades = [] } = useCBCData().useCBCGrades(
    classId,
    undefined,
    term,
    academicYear
  );

  // Load report data
  useEffect(() => {
    const loadReportData = async () => {
      if (!schoolId || !studentId) return;

      try {
        // Get student information
        const { data: studentData } = await supabase
          .from("students")
          .select("*")
          .eq("id", studentId)
          .single();

        // Get class information
        const { data: classData } = await supabase
          .from("classes")
          .select("*")
          .eq("id", classId)
          .single();

        // Get school information
        const { data: schoolData } = await supabase
          .from("schools")
          .select("*")
          .eq("id", schoolId)
          .single();

        // Process strand assessments and grades by subject
        const assessmentsBySubject = {};

        // Process strand assessments
        strandAssessments
          .filter((assessment) => assessment.student_id === studentId)
          .forEach((assessment) => {
            const subjectId = assessment.subject_id || "general";
            if (!assessmentsBySubject[subjectId]) {
              assessmentsBySubject[subjectId] = {
                subject_name: "General Subject", // We'll update this if we have subject data
                overall_performance: "EM",
                strand_performances: {},
                teacher_remarks: "",
                areas_of_strength: [],
                areas_for_improvement: [],
                next_steps: "",
                assessments: [],
              };
            }
            assessmentsBySubject[subjectId].assessments.push(assessment);
          });

        // Process grades
        grades
          .filter((grade) => grade.student_id === studentId)
          .forEach((grade) => {
            const subjectId = grade.learning_area_id || "general";
            if (!assessmentsBySubject[subjectId]) {
              assessmentsBySubject[subjectId] = {
                subject_name: "General Subject",
                overall_performance: "EM",
                strand_performances: {},
                teacher_remarks: "",
                areas_of_strength: [],
                areas_for_improvement: [],
                next_steps: "",
                assessments: [],
              };
            }
            // Convert grade to assessment-like structure
            assessmentsBySubject[subjectId].assessments.push({
              ...grade,
              strand_name: grade.learning_area?.learning_area_name || "General",
              performance_level: grade.performance_level,
              teacher_remarks: grade.teacher_remarks,
            });
          });

        // Calculate overall performance for each subject
        Object.keys(assessmentsBySubject).forEach((subjectId) => {
          const subject = assessmentsBySubject[subjectId];
          const performanceCounts = { EM: 0, AP: 0, PR: 0, AD: 0 };

          subject.assessments.forEach((assessment: AssessmentData) => {
            performanceCounts[assessment.performance_level]++;
            if (assessment.strand_name) {
              subject.strand_performances[assessment.strand_name] =
                assessment.performance_level;
            }
          });

          // Calculate overall performance
          const total =
            performanceCounts.EM +
            performanceCounts.AP +
            performanceCounts.PR +
            performanceCounts.AD;
          if (total > 0) {
            const average =
              (performanceCounts.EM * 1 +
                performanceCounts.AP * 2 +
                performanceCounts.PR * 3 +
                performanceCounts.AD * 4) /
              total;

            if (average >= 3.5) subject.overall_performance = "AD";
            else if (average >= 2.5) subject.overall_performance = "PR";
            else if (average >= 1.5) subject.overall_performance = "AP";
            else subject.overall_performance = "EM";
          }

          // Get teacher remarks from assessments
          const assessmentWithRemarks = subject.assessments.find(
            (a: AssessmentData) => a.teacher_remarks
          );
          if (assessmentWithRemarks) {
            subject.teacher_remarks =
              assessmentWithRemarks.teacher_remarks || "";
          }
        });

        // Get attendance data
        const { data: attendanceData } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", studentId)
          .eq("class_id", classId)
          .gte("date", `${academicYear}-01-01`)
          .lte("date", `${academicYear}-12-31`);

        const totalDays = attendanceData?.length || 0;
        const presentDays =
          attendanceData?.filter((a) => a.status === "present").length || 0;
        const attendancePercentage =
          totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

        const reportData: CBCReportCardData = {
          student_id: studentId,
          student_name: `${studentData?.name || "Unknown Student"}`,
          class_name: classData?.name || "Unknown Class",
          term,
          academic_year: academicYear,
          subjects: Object.values(assessmentsBySubject),
          attendance_percentage: attendancePercentage,
          general_remarks: "",
          principal_remarks: "",
          report_date: new Date().toISOString().split("T")[0],
        };

        setReportData(reportData);
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportData();
  }, [
    studentId,
    classId,
    term,
    academicYear,
    schoolId,
    strandAssessments,
    grades,
  ]);

  // Get performance level info
  const getPerformanceLevelInfo = (level: string) => {
    return CBC_PERFORMANCE_LEVELS.find((l) => l.level_code === level);
  };

  // Get performance level color
  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case "AD":
        return "bg-green-100 text-green-800 border-green-200";
      case "PR":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "AP":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "EM":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Generating CBC Report Card...</span>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-600">Failed to load report data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                CBC Report Card
              </h1>
              <p className="text-blue-700">
                Competency-Based Curriculum Report Card
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>
                <strong>Student:</strong> {reportData.student_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <School className="w-4 h-4" />
              <span>
                <strong>Class:</strong> {reportData.class_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                <strong>Term:</strong> {reportData.term}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>
                <strong>Year:</strong> {reportData.academic_year}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Level Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Performance Level Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CBC_PERFORMANCE_LEVELS.map((level) => (
              <div
                key={level.level_code}
                className="flex items-center gap-2 p-3 rounded-lg border"
              >
                <Badge className={getPerformanceLevelColor(level.level_code)}>
                  {level.level_code}
                </Badge>
                <div className="text-sm">
                  <div className="font-medium">{level.level_name}</div>
                  <div className="text-gray-600">{level.level_description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subject Performance
          </CardTitle>
          <CardDescription>
            Performance levels across all learning areas and strands
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reportData.subjects.map((subject, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {subject.subject_name}
                  </h3>
                  <Badge
                    className={getPerformanceLevelColor(
                      subject.overall_performance
                    )}
                  >
                    {subject.overall_performance} -{" "}
                    {
                      getPerformanceLevelInfo(subject.overall_performance)
                        ?.level_name
                    }
                  </Badge>
                </div>

                {/* Strand Performance */}
                {Object.keys(subject.strand_performances).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Strand Performance:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(subject.strand_performances).map(
                        ([strand, level]) => (
                          <div
                            key={strand}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm">{strand}</span>
                            <Badge className={getPerformanceLevelColor(level)}>
                              {level}
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Teacher Remarks */}
                {subject.teacher_remarks && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Teacher Remarks:</h4>
                    <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded">
                      {subject.teacher_remarks}
                    </p>
                  </div>
                )}

                {/* Areas of Strength */}
                {subject.areas_of_strength &&
                  subject.areas_of_strength.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-green-600" />
                        Areas of Strength:
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {subject.areas_of_strength.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Areas for Improvement */}
                {subject.areas_for_improvement &&
                  subject.areas_for_improvement.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        Areas for Improvement:
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {subject.areas_for_improvement.map(
                          (improvement, idx) => (
                            <li key={idx}>{improvement}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Next Steps */}
                {subject.next_steps && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      Next Steps:
                    </h4>
                    <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded">
                      {subject.next_steps}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attendance Percentage</p>
              <p className="text-2xl font-bold text-blue-600">
                {reportData.attendance_percentage.toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <Badge
                className={
                  reportData.attendance_percentage >= 80
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {reportData.attendance_percentage >= 80 ? "Excellent" : "Good"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Remarks */}
      {(reportData.general_remarks || reportData.principal_remarks) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Additional Remarks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportData.general_remarks && (
              <div>
                <h4 className="font-medium mb-2">General Remarks:</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {reportData.general_remarks}
                </p>
              </div>
            )}
            {reportData.principal_remarks && (
              <div>
                <h4 className="font-medium mb-2">Principal's Remarks:</h4>
                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                  {reportData.principal_remarks}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Report Footer */}
      <Card className="border-2 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <p>Report generated on: {reportData.report_date}</p>
              <p>School: CBC School</p>
            </div>
            <div className="text-right">
              <p>Competency-Based Curriculum</p>
              <p>Ministry of Education, Kenya</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!isPreview && (
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setShowFullReport(true)} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Full Report
          </Button>
          <Button onClick={onPrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
          <Button onClick={onDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      )}

      {/* Full Report Modal */}
      <Dialog open={showFullReport} onOpenChange={setShowFullReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete CBC Report Card</DialogTitle>
            <DialogDescription>
              Detailed view of {reportData.student_name}'s performance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* This would contain the full detailed report */}
            <p>Full detailed report content would be displayed here...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
