import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { CBCCompetency } from "@/types/grading";
import { AlertTriangle, Edit } from "lucide-react";

interface Student {
  id: string;
  name: string;
  admission_number?: string;
  roll_number?: string;
}

interface Subject {
  id: string;
  name: string;
  code?: string;
}

interface CBCGradeValue {
  strand_scores?: Record<string, string>; // strand name -> performance level
  performance_level?: "EM" | "AP" | "PR" | "EX";
  teacher_remarks?: string;
  assessment_type?: string;
  overridden_strand_scores?: Record<string, string>; // for principal overrides
  overridden_performance_level?: "EM" | "AP" | "PR" | "EX";
}

interface CBCGradingSheetProps {
  students: Student[];
  subjects: Subject[];
  grades: Record<string, Record<string, CBCGradeValue>>;
  onGradeChange: (
    studentId: string,
    subjectId: string,
    value: CBCGradeValue
  ) => void;
  isReadOnly?: boolean;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
  isPrincipal?: boolean;
  isViewOnly?: boolean;
}

const CBC_PERFORMANCE_LEVELS = [
  { value: "EX", label: "Exemplary", color: "bg-green-100 text-green-800" },
  { value: "PR", label: "Proficient", color: "bg-blue-100 text-blue-800" },
  {
    value: "AP",
    label: "Approaching Proficiency",
    color: "bg-yellow-100 text-yellow-800",
  },
  { value: "EM", label: "Emerging", color: "bg-red-100 text-red-800" },
];

export const CBCGradingSheet: React.FC<CBCGradingSheetProps> = ({
  students,
  subjects,
  grades,
  onGradeChange,
  isReadOnly = false,
  selectedClass,
  selectedTerm,
  selectedExamType,
  isPrincipal = false,
  isViewOnly = false,
}) => {
  const { schoolId } = useSchoolScopedData();
  const [competencies, setCompetencies] = useState<CBCCompetency[]>([]);
  const [viewMode, setViewMode] = React.useState(isReadOnly || isViewOnly);

  useEffect(() => {
    loadCompetencies();
  }, [schoolId, selectedClass]);

  const loadCompetencies = async () => {
    if (!schoolId || !selectedClass) return;

    try {
      const { data, error } = await supabase
        .from("cbc_competencies")
        .select("*")
        .eq("school_id", schoolId)
        .eq("class_id", selectedClass);

      if (error) throw error;

      const processedData = (data || []).map((comp) => ({
        ...comp,
        strands: Array.isArray(comp.strands)
          ? comp.strands
          : typeof comp.strands === "string"
          ? JSON.parse(comp.strands)
          : [],
      })) as CBCCompetency[];

      setCompetencies(processedData);
    } catch (error) {
      console.error("Error loading CBC competencies:", error);
    }
  };

  // Generate default strands if no competencies are configured
  const getSubjectStrands = (subjectId: string) => {
    const subjectCompetencies = competencies.filter(
      (comp) => comp.subject_id === subjectId
    );

    if (subjectCompetencies.length > 0) {
      return subjectCompetencies;
    }

    // Default strands for subjects without configured competencies
    return [
      {
        id: `default-${subjectId}`,
        competency_name: "General Competency",
        strands: [
          "Communication",
          "Problem Solving",
          "Application",
          "Understanding",
        ],
        school_id: schoolId || "",
        competency_code: "GEN-001",
        description: "General competency assessment",
        sub_strands: [],
        weighting: 1.0,
        class_id: selectedClass,
        subject_id: subjectId,
        assessment_types: ["observation", "written_work", "project_work"],
      },
    ] as CBCCompetency[];
  };

  // Validation: find incomplete assessments
  const incompleteRows = students.filter((student) =>
    subjects.some((subject) => {
      const grade = grades[student.id]?.[subject.id];
      const subjectStrands = getSubjectStrands(subject.id);
      const totalStrands = subjectStrands.reduce(
        (acc, comp) => acc + comp.strands.length,
        0
      );
      const completedStrands = grade?.strand_scores
        ? Object.keys(grade.strand_scores).length
        : 0;
      return completedStrands < totalStrands;
    })
  );

  const calculateOverallPerformance = (
    strandScores: Record<string, string>
  ): "EM" | "AP" | "PR" | "EX" => {
    const scores = Object.values(strandScores).filter((score) => score);
    if (scores.length === 0) return "EM";

    const levelValues = { EM: 1, AP: 2, PR: 3, EX: 4 };
    const average =
      scores.reduce(
        (sum, level) =>
          sum + (levelValues[level as keyof typeof levelValues] || 1),
        0
      ) / scores.length;

    if (average >= 3.5) return "EX";
    if (average >= 2.5) return "PR";
    if (average >= 1.5) return "AP";
    return "EM";
  };

  const handleStrandScoreChange = (
    studentId: string,
    subjectId: string,
    strandName: string,
    performanceLevel: string
  ) => {
    if (viewMode) return;

    const currentGrade = grades[studentId]?.[subjectId] || {};
    const currentStrandScores = currentGrade.strand_scores || {};

    const newStrandScores = {
      ...currentStrandScores,
      [strandName]: performanceLevel,
    };

    const overallPerformance = calculateOverallPerformance(newStrandScores);

    if (isPrincipal) {
      // Principal override
      const currentOverriddenScores =
        currentGrade.overridden_strand_scores || {};
      const newOverriddenScores = {
        ...currentOverriddenScores,
        [strandName]: performanceLevel,
      };

      onGradeChange(studentId, subjectId, {
        ...currentGrade,
        overridden_strand_scores: newOverriddenScores,
        overridden_performance_level: overallPerformance,
      });
    } else {
      // Teacher assessment
      onGradeChange(studentId, subjectId, {
        ...currentGrade,
        strand_scores: newStrandScores,
        performance_level: overallPerformance,
      });
    }
  };

  const handleRemarksChange = (
    studentId: string,
    subjectId: string,
    remarks: string
  ) => {
    if (viewMode) return;

    const currentGrade = grades[studentId]?.[subjectId] || {};
    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      teacher_remarks: remarks,
    });
  };

  const getPerformanceLevelInfo = (level: string) => {
    return (
      CBC_PERFORMANCE_LEVELS.find((l) => l.value === level) ||
      CBC_PERFORMANCE_LEVELS[3]
    );
  };

  return (
    <div className="w-full h-[600px] overflow-auto border rounded-lg bg-white">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between bg-blue-50 border-b p-3 sticky top-0 z-30">
        <div className="flex items-center gap-4 text-sm font-medium text-blue-800">
          <span>CBC Competency-Based Assessment</span>
          <span>•</span>
          <span>
            Class:{" "}
            <strong>
              {subjects.find((s) => s.id === selectedClass)?.name ||
                selectedClass}
            </strong>
          </span>
          <span>•</span>
          <span>
            Term: <strong>{selectedTerm}</strong>
          </span>
          <span>•</span>
          <span>
            Assessment: <strong>{selectedExamType}</strong>
          </span>
          {viewMode && (
            <Badge variant="secondary" className="ml-2">
              Read Only
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="cbc-view-mode-toggle"
            className="text-xs font-medium text-blue-800"
          >
            View Mode
          </label>
          <input
            id="cbc-view-mode-toggle"
            type="checkbox"
            checked={viewMode}
            onChange={() => setViewMode((v) => !v)}
            disabled={isReadOnly || isViewOnly}
            aria-label="Toggle CBC view mode"
            className="accent-blue-600 h-4 w-4"
          />
        </div>
      </div>

      {/* CBC Grading Table */}
      <div className="min-w-fit">
        <table
          className="w-full border-collapse"
          aria-label="CBC Assessment Sheet"
        >
          {/* Table Header */}
          <thead className="bg-gray-100 sticky top-[60px] z-20">
            <tr>
              <th className="border border-gray-300 p-3 text-left font-semibold min-w-[280px] sticky left-0 bg-gray-100 z-25">
                Student Information
              </th>
              {subjects.map((subject) => (
                <th
                  key={subject.id}
                  className="border border-gray-300 p-3 text-center font-semibold min-w-[400px]"
                >
                  <div className="font-medium text-sm">{subject.name}</div>
                  {subject.code && (
                    <div className="text-xs text-gray-600 mt-1">
                      {subject.code}
                    </div>
                  )}
                  <div className="text-xs text-blue-600 mt-1">
                    CBC Strand Assessment
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {students.map((student, studentIndex) => {
              const isIncomplete = incompleteRows.some(
                (s) => s.id === student.id
              );
              return (
                <tr
                  key={student.id}
                  className={`${
                    studentIndex % 2 === 0 ? "bg-gray-25" : "bg-white"
                  } hover:bg-blue-25 transition-colors ${
                    isIncomplete ? "bg-yellow-50" : ""
                  }`}
                >
                  {/* Student Info Cell */}
                  <td
                    className={`border border-gray-300 p-3 sticky left-0 z-10 ${
                      studentIndex % 2 === 0 ? "bg-gray-25" : "bg-white"
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">
                      {student.name}
                    </div>
                    <div className="flex gap-2 text-xs text-gray-600">
                      {student.admission_number && (
                        <span>Adm# {student.admission_number}</span>
                      )}
                      {student.roll_number && (
                        <span>Roll# {student.roll_number}</span>
                      )}
                    </div>
                    {isIncomplete && (
                      <div className="text-xs text-yellow-700 flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3" /> Incomplete
                        Assessment
                      </div>
                    )}
                  </td>

                  {/* Subject Grade Cells */}
                  {subjects.map((subject) => {
                    const gradeValue = grades[student.id]?.[subject.id];
                    const subjectStrands = getSubjectStrands(subject.id);
                    const isOverridden =
                      isPrincipal &&
                      gradeValue?.overridden_strand_scores &&
                      Object.keys(gradeValue.overridden_strand_scores).length >
                        0;

                    return (
                      <td
                        key={`${student.id}-${subject.id}`}
                        className={`border border-gray-300 p-2 ${
                          isOverridden ? "border-blue-500 bg-blue-50" : ""
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Strand Assessments */}
                          <div className="space-y-2">
                            {subjectStrands.map((competency) => (
                              <div
                                key={competency.id}
                                className="border rounded p-2 bg-gray-50"
                              >
                                <div className="text-xs font-medium text-gray-700 mb-2">
                                  {competency.competency_name}
                                </div>
                                <div className="space-y-2">
                                  {competency.strands.map(
                                    (
                                      strand: string | { name: string },
                                      index: number
                                    ) => {
                                      const strandName =
                                        typeof strand === "string"
                                          ? strand
                                          : strand.name ||
                                            `Strand ${index + 1}`;
                                      const currentLevel =
                                        isPrincipal && isOverridden
                                          ? gradeValue
                                              ?.overridden_strand_scores?.[
                                              strandName
                                            ] || ""
                                          : gradeValue?.strand_scores?.[
                                              strandName
                                            ] || "";

                                      return (
                                        <div key={index} className="space-y-1">
                                          <label className="text-xs text-gray-600">
                                            {strandName}
                                          </label>
                                          <Select
                                            value={currentLevel}
                                            onValueChange={(level) =>
                                              handleStrandScoreChange(
                                                student.id,
                                                subject.id,
                                                strandName,
                                                level
                                              )
                                            }
                                            disabled={viewMode}
                                          >
                                            <SelectTrigger className="h-8 text-xs">
                                              <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {CBC_PERFORMANCE_LEVELS.map(
                                                (level) => (
                                                  <SelectItem
                                                    key={level.value}
                                                    value={level.value}
                                                  >
                                                    {level.value} -{" "}
                                                    {level.label}
                                                  </SelectItem>
                                                )
                                              )}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Overridden Indicator */}
                          {isOverridden && (
                            <div className="flex items-center gap-1 text-blue-700 text-xs">
                              <Edit className="h-3 w-3" /> Overridden Assessment
                            </div>
                          )}

                          {/* Overall Performance Level */}
                          {(isPrincipal && isOverridden
                            ? gradeValue?.overridden_performance_level
                            : gradeValue?.performance_level) && (
                            <div className="text-center">
                              <Badge
                                variant="outline"
                                className={`text-xs px-2 py-1 ${
                                  getPerformanceLevelInfo(
                                    isPrincipal && isOverridden
                                      ? gradeValue.overridden_performance_level!
                                      : gradeValue.performance_level!
                                  ).color
                                }`}
                              >
                                {isPrincipal && isOverridden
                                  ? gradeValue.overridden_performance_level
                                  : gradeValue.performance_level}{" "}
                                -{" "}
                                {
                                  getPerformanceLevelInfo(
                                    isPrincipal && isOverridden
                                      ? gradeValue.overridden_performance_level!
                                      : gradeValue.performance_level!
                                  ).label
                                }
                              </Badge>
                            </div>
                          )}

                          {/* Teacher Remarks */}
                          <div className="mt-2">
                            <Textarea
                              placeholder="Remarks..."
                              value={gradeValue?.teacher_remarks || ""}
                              onChange={(e) =>
                                handleRemarksChange(
                                  student.id,
                                  subject.id,
                                  e.target.value
                                )
                              }
                              disabled={viewMode}
                              rows={2}
                              className="text-xs"
                              aria-label={`Remarks for ${student.name} in ${subject.name}`}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
