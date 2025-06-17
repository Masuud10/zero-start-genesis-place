
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Users, Trash2 } from 'lucide-react';

const SubjectManagementTab = () => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    curriculum: 'cbc',
    class_id: '',
    teacher_id: ''
  });

  // Fetch subjects with teacher and class info
  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          classes(id, name),
          profiles!subjects_teacher_id_fkey(id, name)
        `)
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Fetch classes for dropdown
  const { data: classes } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Fetch teachers for dropdown
  const { data: teachers } = useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('school_id', schoolId)
        .eq('role', 'teacher')
        .order('name');
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Create subject mutation
  const createSubject = useMutation({
    mutationFn: async (subjectData: typeof newSubject) => {
      if (!schoolId) throw new Error('No school ID');
      
      const { error } = await supabase
        .from('subjects')
        .insert({
          ...subjectData,
          school_id: schoolId,
          class_id: subjectData.class_id || null,
          teacher_id: subjectData.teacher_id || null
        });
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Subject created successfully." });
      setNewSubject({ name: '', code: '', curriculum: 'cbc', class_id: '', teacher_id: '' });
      queryClient.invalidateQueries({ queryKey: ['subjects', schoolId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  // Update subject assignment mutation
  const updateSubjectAssignment = useMutation({
    mutationFn: async ({ subjectId, teacherId, classId }: { subjectId: string; teacherId?: string; classId?: string }) => {
      if (!schoolId) throw new Error('No school ID');
      
      const { error } = await supabase
        .from('subjects')
        .update({
          teacher_id: teacherId || null,
          class_id: classId || null
        })
        .eq('id', subjectId)
        .eq('school_id', schoolId);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Subject assignment updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['subjects', schoolId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  // Delete subject mutation
  const deleteSubject = useMutation({
    mutationFn: async (subjectId: string) => {
      if (!schoolId) throw new Error('No school ID');
      
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId)
        .eq('school_id', schoolId);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Subject deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ['subjects', schoolId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name || !newSubject.code) {
      toast({ title: "Validation Error", description: "Please fill in subject name and code.", variant: "destructive" });
      return;
    }
    createSubject.mutate(newSubject);
  };

  if (!schoolId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No school assignment found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Subject Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Add New Subject
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSubject} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                value={newSubject.name}
                onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mathematics"
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Subject Code</Label>
              <Input
                id="code"
                value={newSubject.code}
                onChange={(e) => setNewSubject(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., MATH"
                required
              />
            </div>
            <div>
              <Label htmlFor="class">Assign to Class (Optional)</Label>
              <Select value={newSubject.class_id} onValueChange={(value) => setNewSubject(prev => ({ ...prev, class_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Class Assignment</SelectItem>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="teacher">Assign Teacher (Optional)</Label>
              <Select value={newSubject.teacher_id} onValueChange={(value) => setNewSubject(prev => ({ ...prev, teacher_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Teacher Assignment</SelectItem>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={createSubject.isPending} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Subjects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Subjects ({subjects?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSubjects ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {subjects?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No subjects found. Create your first subject to get started.
                </p>
              ) : (
                subjects?.map((subject) => (
                  <div key={subject.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground">Code: {subject.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{subject.curriculum?.toUpperCase() || 'CBC'}</Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteSubject.mutate(subject.id)}
                          disabled={deleteSubject.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Assigned Class</Label>
                        <Select 
                          value={subject.class_id || ''} 
                          onValueChange={(value) => updateSubjectAssignment.mutate({ 
                            subjectId: subject.id, 
                            classId: value,
                            teacherId: subject.teacher_id 
                          })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select Class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Class Assignment</SelectItem>
                            {classes?.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {subject.classes && (
                          <p className="text-xs text-green-600 mt-1">
                            Currently assigned to: {subject.classes.name}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Assigned Teacher</Label>
                        <Select 
                          value={subject.teacher_id || ''} 
                          onValueChange={(value) => updateSubjectAssignment.mutate({ 
                            subjectId: subject.id, 
                            teacherId: value,
                            classId: subject.class_id 
                          })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select Teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Teacher Assignment</SelectItem>
                            {teachers?.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {subject.profiles && (
                          <p className="text-xs text-green-600 mt-1">
                            Currently assigned to: {subject.profiles.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectManagementTab;
