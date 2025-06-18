
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, BookOpen, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { useRelationships } from '@/hooks/useRelationships';

const TeacherSubjectAssignmentQuickAction = () => {
  const { toast } = useToast();
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const { teacherList, classList, subjectList, loadingEntities } = usePrincipalEntityLists(0);
  const { assignTeacher, loading: isAssigning } = useRelationships();

  const handleQuickAssign = async () => {
    if (!selectedTeacher || !selectedClass || !selectedSubject) {
      toast({
        title: "Missing Information",
        description: "Please select teacher, class, and subject",
        variant: "destructive"
      });
      return;
    }

    try {
      await assignTeacher({
        teacherId: selectedTeacher,
        classId: selectedClass,
        subjectId: selectedSubject
      });

      toast({
        title: "Success",
        description: "Teacher assigned to subject successfully"
      });

      // Reset form
      setSelectedTeacher('');
      setSelectedClass('');
      setSelectedSubject('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign teacher",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserCheck className="h-5 w-5" />
          Quick Teacher Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger>
              <SelectValue placeholder="Select Teacher" />
            </SelectTrigger>
            <SelectContent>
              {loadingEntities ? (
                <div className="p-2 text-center text-sm text-muted-foreground">Loading...</div>
              ) : (
                teacherList.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classList.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjectList.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleQuickAssign}
          disabled={isAssigning || !selectedTeacher || !selectedClass || !selectedSubject}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isAssigning ? 'Assigning...' : 'Assign Teacher to Subject'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TeacherSubjectAssignmentQuickAction;
