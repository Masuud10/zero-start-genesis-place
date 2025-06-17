
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
    if (!schoolId) {
      console.error('No school ID available');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching data for school:', schoolId);

      // Fetch subjects, classes, and teachers in parallel with better error handling
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

      // Handle subjects response
      if (subjectsRes.error) {
        console.error('Error fetching subjects:', subjectsRes.error);
        if (subjectsRes.error.code === 'PGRST116') {
          // Table or view doesn't exist or no permission
          throw new Error('Unable to access subjects data. Please check permissions.');
        }
        throw new Error(`Failed to fetch subjects: ${subjectsRes.error.message}`);
      }

      // Handle classes response
      if (classesRes.error) {
        console.error('Error fetching classes:', classesRes.error);
        if (classesRes.error.code === 'PGRST116') {
          throw new Error('Unable to access classes data. Please check permissions.');
        }
        throw new Error(`Failed to fetch classes: ${classesRes.error.message}`);
      }

      // Handle teachers response
      if (teachersRes.error) {
        console.error('Error fetching teachers:', teachersRes.error);
        if (teachersRes.error.code === 'PGRST116') {
          throw new Error('Unable to access teacher data. Please check permissions.');
        }
        throw new Error(`Failed to fetch teachers: ${teachersRes.error.message}`);
      }

      // Set data with null safety
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);

      console.log('Data fetched successfully:', {
        subjects: subjectsRes.data?.length || 0,
        classes: classesRes.data?.length || 0,
        teachers: teachersRes.data?.length || 0
      });

    } catch (error: any) {
      console.error('Error fetching data:', error);
      const errorMessage = error.message || 'Unknown error occurred while fetching data';
      
      toast({
        title: "Error Loading Data",
        description: errorMessage,
        variant: "destructive"
      });

      // Set empty arrays on error to prevent UI crashes
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

    // Check for duplicate subject codes within the school
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
    
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID not found. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    if (!validateFormData()) {
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

      console.log('Submitting subject data:', subjectData);

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
        
        // Handle specific database errors
        if (result.error.code === '23505') {
          // Unique constraint violation
          throw new Error('A subject with this code already exists in your school');
        } else if (result.error.code === '23503') {
          // Foreign key constraint violation
          throw new Error('Invalid class or teacher selection');
        } else if (result.error.code === 'PGRST116') {
          // Permission error
          throw new Error('You do not have permission to create subjects');
        }
        
        throw new Error(result.error.message || 'Failed to save subject');
      }

      console.log('Subject operation successful:', result.data);

      toast({
        title: "Success",
        description: editingId ? "Subject updated successfully" : "Subject created successfully",
      });

      // Reset form and refresh data
      setFormData({ name: '', code: '', class_id: '', teacher_id: '' });
      setEditingId(null);
      await fetchData();

    } catch (error: any) {
      console.error('Error saving subject:', error);
      
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingId ? 'update' : 'create'} subject`,
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
        console.error('Error deleting subject:', error);
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
                  disabled={creating}
                  maxLength={100}
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
                  disabled={creating}
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
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
                            disabled={creating}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(subject.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={creating}
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
