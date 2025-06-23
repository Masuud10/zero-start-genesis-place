
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
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

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
    if (!schoolId) {
      toast({
        title: "Error",
        description: "No school assignment found. Please contact your administrator.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
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
          .select('id, name, email')
          .eq('school_id', schoolId)
          .eq('role', 'teacher')
          .order('name')
      ]);

      if (subjectsRes.error) throw new Error(`Failed to fetch subjects: ${subjectsRes.error.message}`);
      if (classesRes.error) throw new Error(`Failed to fetch classes: ${classesRes.error.message}`);
      if (teachersRes.error) throw new Error(`Failed to fetch teachers: ${teachersRes.error.message}`);

      setSubjects(subjectsRes.data || []);
      setClasses(classesRes.data || []);
      setTeachers(teachersRes.data || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error Loading Data",
        description: error.message || 'Unknown error occurred while fetching data',
        variant: "destructive"
      });

      setSubjects([]);
      setClasses([]);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const validateFormData = () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.code?.trim()) {
      toast({
        title: "Validation Error", 
        description: "Subject code is required",
        variant: "destructive"
      });
      return false;
    }

    if (!schoolId) {
      toast({
        title: "Validation Error",
        description: "School assignment not found. Please refresh the page and try again.",
        variant: "destructive"
      });
      return false;
    }

    const isDuplicate = subjects.some(subject => 
      subject.code.toUpperCase() === formData.code.trim().toUpperCase() && 
      subject.id !== editingId
    );

    if (isDuplicate) {
      toast({
        title: "Validation Error",
        description: "A subject with this code already exists in your school",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      return;
    }

    setCreating(true);
    try {
      const subjectData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        school_id: schoolId!,
        class_id: formData.class_id || null,
        teacher_id: formData.teacher_id || null,
        is_active: true
      };

      let result;
      
      if (editingId) {
        result = await supabase
          .from('subjects')
          .update(subjectData)
          .eq('id', editingId)
          .eq('school_id', schoolId)
          .select();
      } else {
        result = await supabase
          .from('subjects')
          .insert(subjectData)
          .select();
      }

      if (result.error) {
        console.error('Subject operation error:', result.error);
        
        if (result.error.code === '23505') {
          throw new Error('A subject with this code already exists in your school. Please use a different code.');
        } else if (result.error.code === '23503') {
          throw new Error('The selected class or teacher is invalid. Please refresh the page and try again.');
        }
        
        throw new Error(result.error.message || `Failed to ${editingId ? 'update' : 'create'} subject`);
      }

      toast({
        title: "Success",
        description: editingId ? "Subject updated successfully" : "Subject created successfully",
      });

      setFormData({ name: '', code: '', class_id: '', teacher_id: '' });
      setEditingId(null);
      await fetchData();

    } catch (error: any) {
      console.error('Error saving subject:', error);
      
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingId ? 'update' : 'create'} subject. Please try again.`,
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
    if (!confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId)
        .eq('school_id', schoolId);

      if (error) {
        if (error.code === '23503') {
          throw new Error('Cannot delete subject as it is being used in other records (grades, timetables, etc.)');
        }
        throw new Error(error.message || 'Failed to delete subject');
      }

      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });

      await fetchData();
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete subject',
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
    const foundClass = classes.find(c => c.id === classId);
    return foundClass?.name || 'Unknown Class';
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return 'Unassigned';
    const foundTeacher = teachers.find(t => t.id === teacherId);
    return foundTeacher?.name || 'Unknown Teacher';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p>Loading subjects...</p>
      </div>
    );
  }

  if (!schoolId) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">No school assignment found. Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                  disabled={creating}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="subject-code">Subject Code *</Label>
                <Input
                  id="subject-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g., MATH"
                  required
                  disabled={creating}
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="class-select">Class (Optional)</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value }))}
                  disabled={creating}
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
                  disabled={creating}
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
                <Button type="button" variant="outline" onClick={cancelEdit} disabled={creating}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No subjects found. Create your first subject above.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(subject)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
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
