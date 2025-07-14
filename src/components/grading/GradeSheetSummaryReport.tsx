import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Printer,
  FileSpreadsheet,
  GraduationCap,
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react";

interface GradeRecord {
  student_id: string;
  student_name?: string;
  admission_number?: string;
  roll_number?: string;
  subjects: {
    [subjectId: string]: {
      subject_name: string;
      score?: number;
      max_score?: number;
      percentage?: number;
      letter_grade?: string;
      position?: number;
      // CBC specific
      performance_level?: string;
      // IGCSE specific
      coursework_score?: number;
      exam_score?: number;
    };
  };
  total_score?: number;
  total_possible?: number;
  overall_percentage?: number;
  overall_grade?: string;
  overall_position?: number;
}

interface GradeSheetSummaryReportProps {
  className: string;
  curriculumType: string;
  term: string;
  examType: string;
  academicYear: string;
  gradeRecords: GradeRecord[];
  subjects: Array<{ id: string; name: string; code?: string }>;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
}

export const GradeSheetSummaryReport: React.FC<GradeSheetSummaryReportProps> = ({
  className,
  curriculumType,
  term,
  examType,
  academicYear,
  gradeRecords,
  subjects,
  onExportPDF,
  onExportExcel,
  onPrint,
}) => {
  const getCurriculumDisplayName = (type: string) => {
    switch (type?.toLowerCase()) {
      case "cbc":
        return "Competency-Based Curriculum (CBC)";
      case "igcse":
        return "International General Certificate of Secondary Education (IGCSE)";
      case "standard":
        return "Standard 8-4-4 System";
      default:
        return "Standard Curriculum";
    }
  };

  const getGradeBadgeColor = (grade: string) => {
    if (!grade) return "outline";
    const upperGrade = grade.toUpperCase();
    if (upperGrade.includes("A") || upperGrade === "EE") return "default";
    if (upperGrade.includes("B") || upperGrade === "ME") return "secondary";
    if (upperGrade.includes("C") || upperGrade === "AE") return "outline";
    if (upperGrade.includes("D") || upperGrade === "BE") return "destructive";
    return "outline";
  };

  const calculateClassStats = () => {
    if (gradeRecords.length === 0) return { avgPercentage: 0, passRate: 0, topPerformers: 0 };
    
    const totalPercentage = gradeRecords.reduce((sum, record) => sum + (record.overall_percentage || 0), 0);
    const avgPercentage = totalPercentage / gradeRecords.length;
    
    const passCount = gradeRecords.filter(record => (record.overall_percentage || 0) >= 50).length;
    const passRate = (passCount / gradeRecords.length) * 100;
    
    const topPerformers = gradeRecords.filter(record => (record.overall_percentage || 0) >= 80).length;
    
    return { avgPercentage, passRate, topPerformers };
  };

  const { avgPercentage, passRate, topPerformers } = calculateClassStats();

  return (
    <div className="space-y-6 mt-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Grade Sheet Summary Report
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <div className="flex items-center gap-4">
                  <span><strong>Class:</strong> {className}</span>
                  <span><strong>Term:</strong> {term}</span>
                  <span><strong>Exam:</strong> {examType}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span><strong>Academic Year:</strong> {academicYear}</span>
                  <span><strong>Curriculum:</strong> {getCurriculumDisplayName(curriculumType)}</span>
                  <span><strong>Total Students:</strong> {gradeRecords.length}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={onExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={onExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Class Performance Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-800">{avgPercentage.toFixed(1)}%</div>
              <div className="text-sm text-blue-600">Class Average</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-800">{passRate.toFixed(1)}%</div>
              <div className="text-sm text-green-600">Pass Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-800">{topPerformers}</div>
              <div className="text-sm text-purple-600">Top Performers (80%+)</div>
            </div>
          </div>

          {/* Grade Sheet Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Adm. No.</TableHead>
                  {subjects.map((subject) => (
                    <TableHead key={subject.id} className="text-center min-w-[100px]">
                      <div className="space-y-1">
                        <div className="font-medium">{subject.name}</div>
                        {subject.code && (
                          <div className="text-xs text-muted-foreground">({subject.code})</div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Average</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradeRecords.map((record, index) => (
                  <TableRow key={record.student_id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {record.student_name || "Unknown Student"}
                    </TableCell>
                    <TableCell>{record.admission_number || "N/A"}</TableCell>
                    {subjects.map((subject) => {
                      const subjectGrade = record.subjects[subject.id];
                      return (
                        <TableCell key={subject.id} className="text-center">
                          {subjectGrade ? (
                            <div className="space-y-1">
                              {curriculumType?.toLowerCase() === "cbc" ? (
                                <Badge variant={getGradeBadgeColor(subjectGrade.performance_level || "")}>
                                  {subjectGrade.performance_level || "N/A"}
                                </Badge>
                              ) : curriculumType?.toLowerCase() === "igcse" ? (
                                <div className="space-y-1">
                                  <div className="text-sm">
                                    CW: {subjectGrade.coursework_score || "N/A"}
                                  </div>
                                  <div className="text-sm">
                                    Ex: {subjectGrade.exam_score || "N/A"}
                                  </div>
                                  <Badge variant={getGradeBadgeColor(subjectGrade.letter_grade || "")}>
                                    {subjectGrade.letter_grade || "N/A"}
                                  </Badge>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    {subjectGrade.score || 0}/{subjectGrade.max_score || 100}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {subjectGrade.percentage?.toFixed(1) || "0"}%
                                  </div>
                                  <Badge variant={getGradeBadgeColor(subjectGrade.letter_grade || "")}>
                                    {subjectGrade.letter_grade || "N/A"}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-medium">
                      {record.total_score || 0}/{record.total_possible || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.overall_percentage?.toFixed(1) || "0"}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getGradeBadgeColor(record.overall_grade || "")}>
                        {record.overall_grade || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {record.overall_position || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {gradeRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No grade records found for the selected criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeSheetSummaryReport;