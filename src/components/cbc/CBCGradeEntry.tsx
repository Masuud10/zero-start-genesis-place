import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { Loader2, Save, Send } from "lucide-react";

interface Student {
  id: string;
  name: string;
  admission_number: string;
}

interface LearningArea {
  id: string;
  learning_area_name: string;
  learning_area_code: string;
  description: string;
}

type CBCPerformanceLevel = "EM" | "AP" | "PR" | "EX";

interface CBCGrade {
  student_id: string;
  learning_area_id: string;
  performance_level: CBCPerformanceLevel;
  teacher_remarks: string;
}

interface CBCGradeEntryProps {
  classId: string;
  term: string;
  onSubmissionSuccess?: () => void;
}

const CBC_LEVELS = [
  {
    value: "EM" as CBCPerformanceLevel,
    label: "Emerging",
    color: "bg-red-100 text-red-800",
  },
  {
    value: "AP" as CBCPerformanceLevel,
    label: "Approaching Proficiency",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "PR" as CBCPerformanceLevel,
    label: "Proficient",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "EX" as CBCPerformanceLevel,
    label: "Exceeding Expectations",
    color: "bg-green-100 text-green-800",
  },
];

export const CBCGradeEntry: React.FC<CBCGradeEntryProps> = ({
  classId,
  term,
  onSubmissionSuccess,
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [learningAreas, setLearningAreas] = useState<LearningArea[]>([]);
  const [grades, setGrades] = useState<
    Record<string, Record<string, CBCGrade>>
  >({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (classId && schoolId && user?.id) {
      loadData();
    }
  }, [classId, schoolId, user?.id, term]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, name, admission_number")
        .eq("class_id", classId)
        .eq("school_id", schoolId)
        .eq("is_active", true)
        .order("name");

      if (studentsError) throw studentsError;

      // Load CBC learning areas
      const { data: learningAreasData, error: learningAreasError } =
        await supabase
          .from("cbc_learning_areas")
          .select("*")
          .eq("school_id", schoolId)
          .order("learning_area_name");

      if (learningAreasError) throw learningAreasError;

      // Load existing grades
      const { data: existingGrades, error: gradesError } = await supabase
        .from("cbc_grades")
        .select("*")
        .eq("class_id", classId)
        .eq("term", term)
        .eq("teacher_id", user?.id)
        .eq("school_id", schoolId);

      if (gradesError) throw gradesError;

      setStudents(studentsData || []);
      setLearningAreas(learningAreasData || []);

      // Organize existing grades
      const gradesMap: Record<string, Record<string, CBCGrade>> = {};
      existingGrades?.forEach((grade) => {
        if (!gradesMap[grade.student_id]) {
          gradesMap[grade.student_id] = {};
        }
        gradesMap[grade.student_id][grade.learning_area_id] = {
          student_id: grade.student_id,
          learning_area_id: grade.learning_area_id,
          performance_level: grade.performance_level as CBCPerformanceLevel,
          teacher_remarks: grade.teacher_remarks || "",
        };
      });

      setGrades(gradesMap);
    } catch (error: any) {
      console.error("Error loading CBC data:", error);
      toast({
        title: "Error",
        description: "Failed to load CBC grading data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = (
    studentId: string,
    learningAreaId: string,
    field: keyof CBCGrade,
    value: string
  ) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [learningAreaId]: {
          student_id: studentId,
          learning_area_id: learningAreaId,
          performance_level:
            prev[studentId]?.[learningAreaId]?.performance_level || "EM",
          teacher_remarks:
            prev[studentId]?.[learningAreaId]?.teacher_remarks || "",
          [field]: value,
        },
      },
    }));
  };

  const saveAsDraft = async () => {
    setSaving(true);
    try {
      const gradesToSave = [];
      for (const studentId in grades) {
        for (const learningAreaId in grades[studentId]) {
          const grade = grades[studentId][learningAreaId];
          if (grade.performance_level) {
            gradesToSave.push({
              school_id: schoolId,
              student_id: studentId,
              class_id: classId,
              learning_area_id: learningAreaId,
              term: term,
              academic_year: new Date().getFullYear().toString(),
              performance_level: grade.performance_level,
              teacher_remarks: grade.teacher_remarks,
              teacher_id: user?.id,
              status: "draft",
            });
          }
        }
      }

      if (gradesToSave.length === 0) {
        toast({
          title: "No Grades to Save",
          description: "Please enter at least one grade before saving",
          variant: "default",
        });
        return;
      }

      const { error } = await supabase.from("cbc_grades").upsert(gradesToSave, {
        onConflict: "school_id,student_id,learning_area_id,term,academic_year",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${gradesToSave.length} CBC grades saved as draft`,
      });
    } catch (error: any) {
      console.error("Error saving CBC grades:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save CBC grades",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async () => {
    setSubmitting(true);
    try {
      const gradesToSubmit = [];
      for (const studentId in grades) {
        for (const learningAreaId in grades[studentId]) {
          const grade = grades[studentId][learningAreaId];
          if (grade.performance_level) {
            gradesToSubmit.push({
              school_id: schoolId,
              student_id: studentId,
              class_id: classId,
              learning_area_id: learningAreaId,
              term: term,
              academic_year: new Date().getFullYear().toString(),
              performance_level: grade.performance_level,
              teacher_remarks: grade.teacher_remarks,
              teacher_id: user?.id,
              status: "submitted",
              submitted_at: new Date().toISOString(),
            });
          }
        }
      }

      if (gradesToSubmit.length === 0) {
        toast({
          title: "No Grades to Submit",
          description: "Please enter at least one grade before submitting",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("cbc_grades")
        .upsert(gradesToSubmit, {
          onConflict:
            "school_id,student_id,learning_area_id,term,academic_year",
        });

      if (error) throw error;

      // Create submission batch
      const { error: batchError } = await supabase
        .from("cbc_grade_batches")
        .upsert(
          {
            school_id: schoolId,
            class_id: classId,
            term: term,
            academic_year: new Date().getFullYear().toString(),
            teacher_id: user?.id,
            batch_name: `CBC ${term} - ${new Date().toLocaleDateString()}`,
            total_students: students.length,
            grades_entered: gradesToSubmit.length,
            status: "submitted",
            submitted_at: new Date().toISOString(),
          },
          {
            onConflict: "school_id,class_id,term,academic_year,teacher_id",
          }
        );

      if (batchError) console.warn("Batch creation warning:", batchError);

      toast({
        title: "Success",
        description: `${gradesToSubmit.length} CBC grades submitted for principal approval`,
      });

      if (onSubmissionSuccess) onSubmissionSuccess();
    } catch (error: any) {
      console.error("Error submitting CBC grades:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit CBC grades",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading CBC grading data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">Student</th>
                  {learningAreas.map((area) => (
                    <th
                      key={area.id}
                      className="text-center p-3 font-medium min-w-[200px]"
                    >
                      {area.learning_area_name}
                      <div className="text-xs text-gray-500 font-normal">
                        {area.learning_area_code}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">
                        {student.admission_number}
                      </div>
                    </td>
                    {learningAreas.map((area) => (
                      <td key={area.id} className="p-3">
                        <div className="space-y-2">
                          <Select
                            value={
                              grades[student.id]?.[area.id]
                                ?.performance_level || ""
                            }
                            onValueChange={(value) =>
                              updateGrade(
                                student.id,
                                area.id,
                                "performance_level",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                            <SelectContent>
                              {CBC_LEVELS.map((level) => (
                                <SelectItem
                                  key={level.value}
                                  value={level.value}
                                >
                                  {level.value} - {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Textarea
                            placeholder="Teacher remarks..."
                            value={
                              grades[student.id]?.[area.id]?.teacher_remarks ||
                              ""
                            }
                            onChange={(e) =>
                              updateGrade(
                                student.id,
                                area.id,
                                "teacher_remarks",
                                e.target.value
                              )
                            }
                            className="w-full text-sm"
                            rows={2}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              CBC Assessment Entry for {students.length} students across{" "}
              {learningAreas.length} learning areas
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={saveAsDraft}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Draft
                  </>
                )}
              </Button>

              <Button
                onClick={submitForApproval}
                disabled={submitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit for Principal Approval
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
