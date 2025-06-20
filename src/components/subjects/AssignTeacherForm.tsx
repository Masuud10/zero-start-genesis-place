
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSubjectService } from '@/hooks/useSubjectService';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { SubjectService } from '@/services/subjectService';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { UserPlus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SubjectAssignment } from '@/types/subject';

interface AssignTeacherFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignTeacherForm: React.FC<AssignTeacherFormProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const { createAssignment, removeAssignment, loading } = useSubjectService();
  const { classList, teacherList, loadingEntities } = usePrincipalEntityLists(0);
  const { schoolId } = useSchoolScopedData();

  const fetchData = async () => {
    if (!schoolId) return;

    setLoadingData(true);
    try {
      const [subjectsData, assignmentsData] = await Promise.all([
        SubjectService.getSubjects(schoolId),
        SubjectService.getAssignments(schoolId, selectedClass || undefined)
      ]);
      
      setSubjects(subjectsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (open && schoolId) {
      fetchData();
    }
  }, [open, selectedClass, schoolId]);

  const handleAssign = async () => {
    if (!selectedClass || !selectedSubject || !selectedTeacher) {
      return;
    }

    const result = await createAssignment({
      subject_id: selectedSubject,
      teacher_id: selectedTeacher,
      class_id: selectedClass
    });

    if (result) {
      setSelectedSubject('');
      setSelectedTeacher('');
      fetchData();
      onSuccess();
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    const success = await removeAssignment(assignmentId);
    if (success) {
      fetchData();
      onSuccess();
    }
  };

  const handleClose = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedTeacher('');
    setAssignments([]);
    setSubjects([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Teacher Subject Assignment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Select Class to Manage</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {classList.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClass && (
            <>
              <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                <h3 className="font-semibold">Create New Assignment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingData ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Loading subjects...
                          </div>
                        ) : subjects.length > 0 ? (
                          subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name} ({subject.code})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            No subjects available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Teacher</Label>
                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherList.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={handleAssign}
                      disabled={loading || loadingData || !selectedSubject || !selectedTeacher || loadingEntities}
                      className="w-full"
                    >
                      {loading ? "Assigning..." : "Assign"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">
                  Current Assignments for {classList.find(c => c.id === selectedClass)?.name}
                </h3>
                
                {loadingData ? (
                  <div className="text-center py-4">Loading assignments...</div>
                ) : assignments.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignments.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{assignment.subject?.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {assignment.subject?.code}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{assignment.teacher?.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {assignment.teacher?.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={assignment.is_active ? "default" : "secondary"}>
                                {assignment.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {assignment.is_active && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveAssignment(assignment.id)}
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No assignments found for this class
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTeacherForm;
