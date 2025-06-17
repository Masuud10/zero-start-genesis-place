
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useAuth } from '@/contexts/AuthContext';

interface Subject {
  id: string;
  name: string;
  code: string;
  class_id?: string;
  teacher_id?: string;
  school_id: string;
  created_at: string;
}

interface Class {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
}

const SubjectManagementTab = () => {
  const { schoolId } = useSchoolScopedData();
  const { user } = useAuth();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    class_id: '',
    teacher_id: ''
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (schoolId) {
      fetchData();
    }
  }, [schoolId]);

  const fetchData = async () => {
    if (!schoolId) return;

    setLoading(true);
    try {
      // Fetch subjects, classes, and teachers in parallel
      const [subjectsRes, classesRes, teachersRes] = await Promise.all([
        supabase
          .from('subjects')
          .select('*')
          .eq('school_id', schoolId)
          .order('name'),
        supabase
          .from('classes')
          .select('id, name')
          .eq('school_id', schoolId)
          .order('name'),
        supabase
          .from('profiles')
          .select('id, name')
          .eq('school_id', schoolId)
          .eq('role', 'teacher')
          .order('name')
      ]);

      if (subjectsRes.error) throw subjectsRes.error;
      if (classesRes.error) throw classesRes.error;
      if (teachersRes.error) throw teachersRes.error;

      setSubjects(subjectsRes.data || []);
      setClasses(classesRes.data || []);
      setTeachers(teachersRes.data || []);

      console.log('Fetched data:', {
        subjects: subjectsRes.data?.length,
        classes: classesRes.data?.length,
        teachers: teachersRes.data?.length
      });

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID not found",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Error",
        description: "Subject name and code are required",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const subjectData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        school_id: schoolId,
        class_id: formData.class_id || null,
        teacher_id: formData.teacher_id || null,
      };

      let result;
      
      if (editingId) {
        // Update existing subject
        result = await supabase
          .from('subjects')
          .update(subjectData)
          .eq('id', editingId)
          .eq('school_id', schoolId)
          .select()
          .single();
      } else {
        // Create new subject
        result = await supabase
          .from('subjects')
          .insert(subjectData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Subject operation error:', result.error);
        throw result.error;
      }

      toast({
        title: "Success",
        description: editingId ? "Subject updated successfully" : "Subject created successfully",
      });

      // Reset form and refresh data
      setFormData({ name: '', code: '', class_id: '', teacher_id: '' });
      setEditingId(null);
      fetchData();

    } catch (error: any) {
      console.error('Error saving subject:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingId ? 'update' : 'create'} subject: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setFormData({
      name: subject.name,
      code: subject.code,
      class_id: subject.class_id || '',
      teacher_id: subject.teacher_id || ''
    });
    setEditingId(subject.id);
  };

  const handleDelete = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId)
        .eq('school_id', schoolId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      toast({
        title: "Error",
        description: "Failed to delete subject: " + error.message,
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setFormData({ name: '', code: '', class_id: '', teacher_id: '' });
    setEditingId(null);
  };

  const getClassName = (classId?: string) => {
    if (!classId) return 'All Classes';
    return classes.find(c => c.id === classId)?.name || 'Unknown Class';
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return 'Unassigned';
    return teachers.find(t => t.id === teacherId)?.name || 'Unknown Teacher';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        Loading subjects...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subject Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Create and manage subjects for your school
          </p>
        </div>
      </div>

      {/* Subject Creation/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? 'Edit Subject' : 'Add New Subject'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject-name">Subject Name *</Label>
                <Input
                  id="subject-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              <div>
                <Label htmlFor="subject-code">Subject Code *</Label>
                <Input
                  id="subject-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., MATH"
                  required
                />
              </div>
              <div>
                <Label htmlFor="class-select">Class (Optional)</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="teacher-select">Teacher (Optional)</Label>
                <Select
                  value={formData.teacher_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, teacher_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    {editingId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {editingId ? 'Update Subject' : 'Create Subject'}
                  </>
                )}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Subjects List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Subjects ({subjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No subjects found</p>
              <p className="text-sm">Create your first subject using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{subject.code}</Badge>
                      </TableCell>
                      <TableCell>{getClassName(subject.class_id)}</TableCell>
                      <TableCell>{getTeacherName(subject.teacher_id)}</TableCell>
                      <TableCell>
                        {new Date(subject.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(subject)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(subject.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectManagementTab;
