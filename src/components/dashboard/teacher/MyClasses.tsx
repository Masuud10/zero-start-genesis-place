import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TeacherTimetableModal from "@/components/modals/TeacherTimetableModal";
import TeacherGradeBookModal from "@/components/modals/TeacherGradeBookModal";
import TeacherClassListModal from "@/components/modals/TeacherClassListModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import {
  BookOpen,
  Users,
  ClipboardList,
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ClassAssignment {
  class_id: string;
  subject_id: string;
  class: {
    id: string;
    name: string;
    level?: string;
    stream?: string;
  };
  subject: {
    id: string;
    name: string;
    code?: string;
  };
  student_count: number;
}

const MyClasses: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const [timetableModal, setTimetableModal] = useState({
    open: false,
    classId: "",
    className: "",
  });
  const [gradeBookModal, setGradeBookModal] = useState({
    open: false,
    classId: "",
    className: "",
  });
  const [classListModal, setClassListModal] = useState({
    open: false,
    classId: "",
    className: "",
  });

  const {
    data: assignments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teacher-assignments", user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) return [];

      console.log("Fetching teacher assignments for:", user.id);

      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          // Get teacher's subject assignments with class and subject details
          const { data: assignmentData, error: assignmentError } =
            await supabase
              .from("subject_teacher_assignments")
              .select(
                `
              class_id,
              subject_id,
              classes!inner(id, name, level, stream),
              subjects!inner(id, name, code)
            `
              )
              .eq("teacher_id", user.id)
              .eq("school_id", schoolId)
              .eq("is_active", true)
              .not("class_id", "is", null)
              .not("subject_id", "is", null);

          if (assignmentError) {
            console.error("Error fetching assignments:", assignmentError);
            throw assignmentError;
          }

          if (!assignmentData || assignmentData.length === 0) {
            console.log("No assignments found for teacher");
            return [];
          }

          // Get student counts for each class
          const classIds = [
            ...new Set(assignmentData?.map((a) => a.class_id) || []),
          ];
          const studentCounts: { [key: string]: number } = {};

          for (const classId of classIds) {
            const { count } = await supabase
              .from("students")
              .select("*", { count: "exact", head: true })
              .eq("class_id", classId)
              .eq("school_id", schoolId)
              .eq("is_active", true);

            studentCounts[classId] = count || 0;
          }

          // Transform the data
          const assignments: ClassAssignment[] =
            assignmentData?.map((assignment) => ({
              class_id: assignment.class_id,
              subject_id: assignment.subject_id,
              class: assignment.classes,
              subject: assignment.subjects,
              student_count: studentCounts[assignment.class_id] || 0,
            })) || [];

          // Add warning if no students found in any class
          const totalStudents = Object.values(studentCounts).reduce(
            (sum, count) => sum + count,
            0
          );
          if (totalStudents === 0 && classIds.length > 0) {
            console.warn("⚠️ No students found in teacher's assigned classes");
          }

          return assignments;
        } catch (error) {
          attempts++;
          console.error(
            `Error in MyClasses (attempt ${attempts}/${maxAttempts}):`,
            error
          );

          // If this is the last attempt, throw the error
          if (attempts >= maxAttempts) {
            throw error;
          }

          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempts) * 1000)
          );
        }
      }

      // This should never be reached, but TypeScript requires it
      throw new Error(
        "Failed to fetch teacher assignments after all retry attempts"
      );
    },
    enabled: !!user?.id && !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Let our custom retry logic handle it
  });

  // Group assignments by class
  const assignmentsByClass =
    assignments?.reduce((acc, assignment) => {
      const classKey = assignment.class.id;
      if (!acc[classKey]) {
        acc[classKey] = {
          class: assignment.class,
          student_count: assignment.student_count,
          subjects: [],
        };
      }
      acc[classKey].subjects.push(assignment.subject);
      return acc;
    }, {} as { [key: string]: { class: ClassAssignment["class"]; student_count: number; subjects: ClassAssignment["subject"][] } }) ||
    {};

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Class Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading assignments...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("My classes error:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Class Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to load assignments</p>
              {process.env.NODE_ENV === "development" && (
                <p className="text-xs mt-1 text-gray-500">
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const classKeys = Object.keys(assignmentsByClass);

  if (classKeys.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Class Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No Class Assignments</p>
            <p className="text-sm mt-1">
              You haven't been assigned any classes or subjects yet.
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Contact your administrator for class assignments.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Class Assignments
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {classKeys.length} {classKeys.length === 1 ? "Class" : "Classes"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classKeys.map((classKey) => {
            const classData = assignmentsByClass[classKey];
            return (
              <div
                key={classKey}
                className="border rounded-lg p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                {/* Class Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {classData.class.name}
                      </h3>
                      {(classData.class.level || classData.class.stream) && (
                        <p className="text-sm text-gray-600">
                          {classData.class.level}{" "}
                          {classData.class.stream &&
                            `- ${classData.class.stream}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Users className="h-3 w-3" />
                      {classData.student_count} Students
                    </Badge>
                  </div>
                </div>

                {/* Subjects */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <ClipboardList className="h-4 w-4" />
                    Teaching Subjects ({classData.subjects.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {classData.subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="flex items-center justify-between p-2 bg-white border rounded text-sm"
                      >
                        <div>
                          <span className="font-medium text-gray-900">
                            {subject.name}
                          </span>
                          {subject.code && (
                            <span className="text-gray-500 ml-1">
                              ({subject.code})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() =>
                      setTimetableModal({
                        open: true,
                        classId: classData.class.id,
                        className: classData.class.name,
                      })
                    }
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    View Timetable
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() =>
                      setGradeBookModal({
                        open: true,
                        classId: classData.class.id,
                        className: classData.class.name,
                      })
                    }
                  >
                    <ClipboardList className="h-3 w-3 mr-1" />
                    Grade Book
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() =>
                      setClassListModal({
                        open: true,
                        classId: classData.class.id,
                        className: classData.class.name,
                      })
                    }
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Class List
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t bg-blue-50 -m-4 p-4 rounded-b-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-blue-700">
                <strong>{classKeys.length}</strong>{" "}
                {classKeys.length === 1 ? "Class" : "Classes"}
              </span>
              <span className="text-blue-700">
                <strong>{assignments?.length || 0}</strong> Subject Assignments
              </span>
              <span className="text-blue-700">
                <strong>
                  {Object.values(assignmentsByClass).reduce(
                    (sum, data) => sum + data.student_count,
                    0
                  )}
                </strong>{" "}
                Total Students
              </span>
            </div>
            <Badge variant="default" className="bg-blue-600">
              Active Assignments
            </Badge>
          </div>
        </div>

        {/* Modals */}
        <TeacherTimetableModal
          open={timetableModal.open}
          onClose={() =>
            setTimetableModal({ open: false, classId: "", className: "" })
          }
          classId={timetableModal.classId}
          className={timetableModal.className}
        />

        <TeacherGradeBookModal
          open={gradeBookModal.open}
          onClose={() =>
            setGradeBookModal({ open: false, classId: "", className: "" })
          }
          classId={gradeBookModal.classId}
          className={gradeBookModal.className}
        />

        <TeacherClassListModal
          open={classListModal.open}
          onClose={() =>
            setClassListModal({ open: false, classId: "", className: "" })
          }
          classId={classListModal.classId}
          className={classListModal.className}
        />
      </CardContent>
    </Card>
  );
};

export default MyClasses;
