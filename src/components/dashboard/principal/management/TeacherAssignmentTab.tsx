import React, { useState } from "react";
import { usePrincipalEntityLists } from "@/hooks/usePrincipalEntityLists";
import { useTeacherAssignments } from "@/hooks/useTeacherAssignments";
import { useRelationships } from "@/hooks/useRelationships";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Trash2 } from "lucide-react";

const TeacherAssignmentTab = () => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );

  const { classList, teacherList, subjectList, loadingEntities } =
    usePrincipalEntityLists(0);
  const { data: assignments, isLoading: loadingAssignments } =
    useTeacherAssignments(selectedClassId);
  const {
    assignTeacher,
    unassignTeacher,
    loading: isAssigning,
  } = useRelationships();

  // Find the selected class and its curriculum
  const selectedClass = classList.find((c) => c.id === selectedClassId);
  const classCurriculum = selectedClass?.curriculum_type;

  // Filter subjects to only those matching the class curriculum
  const filteredSubjectList = subjectList.filter(
    (s) => !classCurriculum || s.curriculum === classCurriculum
  );

  const handleAssign = async () => {
    if (!selectedClassId || !selectedTeacherId || !selectedSubjectId) {
      return;
    }
    // Prevent assignment if curriculum does not match
    const subject = subjectList.find((s) => s.id === selectedSubjectId);
    if (classCurriculum && subject && subject.curriculum !== classCurriculum) {
      alert("Cannot assign: Subject and class curriculum do not match.");
      return;
    }
    try {
      await assignTeacher({
        teacherId: selectedTeacherId,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
      });
      setSelectedTeacherId(null);
      setSelectedSubjectId(null);
    } catch (error) {
      console.error("Failed to assign teacher:", error);
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    try {
      await unassignTeacher({ assignmentId, classId: selectedClassId });
    } catch (error) {
      console.error("Failed to unassign teacher:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Assignments</CardTitle>
        <CardDescription>
          Assign teachers to the classes and subjects they will teach.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            onValueChange={(value) => setSelectedClassId(value)}
            value={selectedClassId || ""}
          >
            <SelectTrigger className="md:w-1/3">
              <SelectValue placeholder="1. Select a Class to manage" />
            </SelectTrigger>
            <SelectContent>
              {loadingEntities ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading classes...
                </div>
              ) : (
                classList.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedClassId && (
          <>
            <div className="p-4 border rounded-md space-y-4 bg-muted/40">
              <h3 className="font-semibold text-md">2. Add New Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <Select
                  onValueChange={setSelectedTeacherId}
                  value={selectedTeacherId || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherList.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={setSelectedSubjectId}
                  value={selectedSubjectId || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubjectList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAssign}
                  disabled={
                    isAssigning || !selectedTeacherId || !selectedSubjectId
                  }
                >
                  {isAssigning && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Assign Teacher
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-md mb-2">
                Current Assignments for{" "}
                {classList.find((c) => c.id === selectedClassId)?.name}
              </h3>
              <div className="border rounded-md">
                {loadingAssignments ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments && assignments.length > 0 ? (
                        assignments.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>{a.teacher.name}</TableCell>
                            <TableCell>{a.subject.name}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUnassign(a.id)}
                                disabled={isAssigning}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center h-24 text-muted-foreground"
                          >
                            No teachers assigned to this class yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
export default TeacherAssignmentTab;
