
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSubjectManagement, SubjectAssignment } from '@/hooks/useSubjectManagement';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { useSubjects } from '@/hooks/useSubjects';
import { UserPlus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface TeacherAssignmentFormProps {
  open: boolean;
  onClose: () => void;
  onAssignmentCreated: () => void;
}

const TeacherAssignmentForm: React.FC<TeacherAssignmentFormProps> = ({
  open,
  onClose,
  onAssignmentCreated
}) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);

  const { assignTeacherToSubject, getSubjectAssignments, removeAssignment, loading } = useSubjectManagement();
  const { classList, teacherList, loadingEntities } = usePrincipalEntityLists(0);
  
  // Fetch all subjects for the school, not filtered by class
  const { subjects: allSubjects, loading: subjectsLoading } = useSubjects();

  const fetchAssignments = async () => {
    const data = await getSubjectAssignments(selectedClass || undefined);
    setAssignments(data);
  };

  useEffect(() => {
    if (open) {
      fetchAssignments();
    }
  }, [open, selectedClass]);

  const handleAssign = async () => {
    if (!selectedClass || !selectedSubject || !selectedTeacher) {
      return;
    }

    const result = await assignTeacherToSubject({
      subject_id: selectedSubject,
      teacher_id: selectedTeacher,
      class_id: selectedClass
    });

    if (result) {
      setSelectedSubject('');
      setSelectedTeacher('');
      fetchAssignments();
      onAssignmentCreated();
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    const success = await removeAssignment(assignmentId);
    if (success) {
      fetchAssignments();
      onAssignmentCreated();
    }
  };

  const handleClose = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedTeacher('');
    setAssignments([]);
    onClose();
  };

  // Show all subjects available for assignment
  const availableSubjects = allSubjects || [];

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
          {/* Class Selection */}
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
              {/* Assignment Form */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Create New Assignment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectsLoading ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Loading subjects...
                          </div>
                        ) : availableSubjects.length > 0 ? (
                          availableSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name} ({subject.code})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            No subjects available. Please create subjects first.
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
                      disabled={loading || !selectedSubject || !selectedTeacher || loadingEntities || subjectsLoading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Assign
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Current Assignments */}
              <div className="space-y-4">
                <h3 className="font-semibold">
                  Current Assignments for {classList.find(c => c.id === selectedClass)?.name}
                </h3>
                
                {assignments.length > 0 ? (
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
                                <div className="font-medium">{assignment.subject.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {assignment.subject.code}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{assignment.teacher.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {assignment.teacher.email}
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

export default TeacherAssignmentForm;
