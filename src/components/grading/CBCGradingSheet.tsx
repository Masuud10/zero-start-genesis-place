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
}) => {
  const { schoolId } = useSchoolScopedData();
  const [competencies, setCompetencies] = useState<CBCCompetency[]>([]);

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
    if (isReadOnly) return;

    const currentGrade = grades[studentId]?.[subjectId] || {};
    const currentStrandScores = currentGrade.strand_scores || {};

    const newStrandScores = {
      ...currentStrandScores,
      [strandName]: performanceLevel,
    };

    const overallPerformance = calculateOverallPerformance(newStrandScores);

    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      strand_scores: newStrandScores,
      performance_level: overallPerformance,
    });
  };

  const handleRemarksChange = (
    studentId: string,
    subjectId: string,
    remarks: string
  ) => {
    if (isReadOnly) return;

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

  return (
    <div className="w-full h-[600px] overflow-auto border rounded-lg bg-white">
      {/* Header Info */}
      <div className="bg-blue-50 border-b p-3 sticky top-0 z-30">
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
          {isReadOnly && (
            <Badge variant="secondary" className="ml-2">
              Read Only
            </Badge>
          )}
        </div>
      </div>

      {/* CBC Grading Table */}
      <div className="min-w-fit">
        <table className="w-full border-collapse">
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
            {students.map((student, studentIndex) => (
              <tr
                key={student.id}
                className={`${
                  studentIndex % 2 === 0 ? "bg-gray-25" : "bg-white"
                } hover:bg-blue-25 transition-colors`}
              >
                {/* Student Info Cell */}
                <td
                  className={`border border-gray-300 p-3 sticky left-0 z-10 ${
                    studentIndex % 2 === 0 ? "bg-gray-25" : "bg-white"
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{student.name}</div>
                  <div className="flex gap-2 text-xs text-gray-600">
                    {student.admission_number && (
                      <span>Adm# {student.admission_number}</span>
                    )}
                    {student.roll_number && (
                      <span>Roll# {student.roll_number}</span>
                    )}
                  </div>
                </td>

                {/* Subject Grade Cells */}
                {subjects.map((subject) => {
                  const gradeValue = grades[student.id]?.[subject.id];
                  const subjectStrands = getSubjectStrands(subject.id);

                  return (
                    <td
                      key={`${student.id}-${subject.id}`}
                      className="border border-gray-300 p-2"
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
                                        : strand.name || `Strand ${index + 1}`;
                                    const currentLevel =
                                      gradeValue?.strand_scores?.[strandName] ||
                                      "";

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
                                          disabled={isReadOnly}
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
                                                  {level.value} - {level.label}
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

                        {/* Overall Performance Level */}
                        {gradeValue?.performance_level && (
                          <div className="text-center">
                            <Badge
                              variant="outline"
                              className={`text-xs px-2 py-1 ${
                                getPerformanceLevelInfo(
                                  gradeValue.performance_level
                                ).color
                              }`}
                            >
                              {gradeValue.performance_level} -{" "}
                              {
                                getPerformanceLevelInfo(
                                  gradeValue.performance_level
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
                            disabled={isReadOnly}
                            rows={2}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
