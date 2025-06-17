
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CreateSubjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Class {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
}

const CreateSubjectForm: React.FC<CreateSubjectFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    class_id: '',
    teacher_id: '',
    curriculum: 'cbc'
  });

  // Fetch classes and teachers on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.school_id) {
        toast({
          title: "Error",
          description: "No school assigned to your account",
          variant: "destructive"
        });
        return;
      }

      try {
        setLoadingData(true);
        
        // Fetch classes for the current school
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name')
          .eq('school_id', user.school_id)
          .order('name');

        if (classesError) {
          console.error('Classes fetch error:', classesError);
          throw new Error('Failed to fetch classes');
        }

        // Fetch teachers for the current school
        const { data: teachersData, error: teachersError } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('school_id', user.school_id)
          .eq('role', 'teacher')
          .order('name');

        if (teachersError) {
          console.error('Teachers fetch error:', teachersError);
          throw new Error('Failed to fetch teachers');
        }

        setClasses(classesData || []);
        setTeachers(teachersData || []);
        
      } catch (error: any) {
        console.error('Data fetch error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load form data",
          variant: "destructive"
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user?.school_id, toast]);

  const validateFormInputs = () => {
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

    if (!user?.school_id) {
      toast({
        title: "Error",
        description: "No school assignment found",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormInputs()) {
      return;
    }

    try {
      setLoading(true);
      
      console.log('Creating subject with data:', {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        class_id: formData.class_id || null,
        teacher_id: formData.teacher_id || null,
        curriculum: formData.curriculum,
        school_id: user!.school_id
      });

      // Check for duplicate subject code in the same school
      const { data: existingSubject, error: checkError } = await supabase
        .from('subjects')
        .select('id, code')
        .eq('school_id', user!.school_id)
        .eq('code', formData.code.trim().toUpperCase())
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for duplicate subject:', checkError);
        throw new Error(`Failed to validate subject code: ${checkError.message}`);
      }

      if (existingSubject) {
        toast({
          title: "Duplicate Subject",
          description: `A subject with code "${formData.code.trim().toUpperCase()}" already exists`,
          variant: "destructive"
        });
        return;
      }

      // Validate class and teacher exist and belong to the correct school
      if (formData.class_id) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('id', formData.class_id)
          .eq('school_id', user!.school_id)
          .maybeSingle();

        if (classError || !classData) {
          throw new Error('Invalid class selected');
        }
      }

      if (formData.teacher_id) {
        const { data: teacherData, error: teacherError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', formData.teacher_id)
          .eq('school_id', user!.school_id)
          .eq('role', 'teacher')
          .maybeSingle();

        if (teacherError || !teacherData) {
          throw new Error('Invalid teacher selected');
        }
      }

      // Create subject with proper school_id and foreign keys
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          class_id: formData.class_id || null,
          teacher_id: formData.teacher_id || null,
          curriculum: formData.curriculum,
          school_id: user!.school_id
        })
        .select();

      if (error) {
        console.error('Subject creation error:', error);
        
        if (error.code === '23505') {
          throw new Error('A subject with this code already exists');
        } else if (error.code === '23503') {
          throw new Error('Invalid class or teacher selected');
        } else if (error.message.includes('row-level security')) {
          throw new Error('You don\'t have permission to create subjects');
        } else {
          throw new Error(error.message || 'Failed to create subject');
        }
      }

      console.log('Subject created successfully:', data);

      toast({
        title: "Success",
        description: "Subject created successfully",
        variant: "default"
      });

      // Reset form
      setFormData({
        name: '',
        code: '',
        class_id: '',
        teacher_id: '',
        curriculum: 'cbc'
      });

      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading form data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Subject</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Subject Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mathematics"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="code">Subject Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., MATH"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class_id">Class (Optional)</Label>
              <Select 
                value={formData.class_id} 
                onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
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
              <Label htmlFor="teacher_id">Teacher (Optional)</Label>
              <Select 
                value={formData.teacher_id} 
                onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No teacher assigned</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="curriculum">Curriculum</Label>
            <Select 
              value={formData.curriculum} 
              onValueChange={(value) => setFormData({ ...formData, curriculum: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cbc">CBC (Competency Based Curriculum)</SelectItem>
                <SelectItem value="8-4-4">8-4-4 System</SelectItem>
                <SelectItem value="igcse">IGCSE</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Subject
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateSubjectForm;
