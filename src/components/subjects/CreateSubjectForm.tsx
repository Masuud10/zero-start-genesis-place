
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.school_id) {
      toast({
        title: "Error",
        description: "No school assigned to your account",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.code || !formData.class_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create subject with proper school_id and foreign keys
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          class_id: formData.class_id,
          teacher_id: formData.teacher_id || null,
          curriculum: formData.curriculum,
          school_id: user.school_id // Ensure school_id is set correctly
        })
        .select()
        .single();

      if (error) {
        console.error('Subject creation error:', error);
        
        // Handle specific error types
        if (error.code === '23505') {
          toast({
            title: "Duplicate Subject",
            description: "A subject with this code already exists for this class",
            variant: "destructive"
          });
        } else if (error.code === '23503') {
          toast({
            title: "Invalid Reference",
            description: "Invalid class or teacher selected",
            variant: "destructive"
          });
        } else if (error.message.includes('row-level security')) {
          toast({
            title: "Permission Denied",
            description: "You don't have permission to create subjects",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to create subject",
            variant: "destructive"
          });
        }
        return;
      }

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
        description: "An unexpected error occurred",
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
              />
            </div>
            
            <div>
              <Label htmlFor="code">Subject Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., MATH"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class_id">Class *</Label>
              <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
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
              <Select value={formData.teacher_id} onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}>
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
            <Select value={formData.curriculum} onValueChange={(value) => setFormData({ ...formData, curriculum: value })}>
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
              <Button type="button" variant="outline" onClick={onCancel}>
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
