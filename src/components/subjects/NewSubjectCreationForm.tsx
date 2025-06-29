
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Save, X, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { SubjectDatabaseService } from '@/services/subject/subjectDatabaseService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name must be at least 2 characters'),
  code: z.string().min(2, 'Subject code must be at least 2 characters').max(20, 'Subject code must be 20 characters or less'),
  curriculum: z.enum(['cbc', 'igcse'], {
    required_error: 'Please select a curriculum type'
  }),
  category: z.enum(['core', 'elective', 'optional'], {
    required_error: 'Please select a category'
  }),
  class_id: z.string().optional(),
  teacher_id: z.string().optional(),
  credit_hours: z.number().min(1, 'Credit hours must be at least 1').max(10, 'Credit hours cannot exceed 10'),
  assessment_weight: z.number().min(1, 'Assessment weight must be at least 1%').max(100, 'Assessment weight cannot exceed 100%'),
  description: z.string().optional(),
  is_active: z.boolean()
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface NewSubjectCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  classes: Array<{ id: string; name: string; }>;
  teachers: Array<{ id: string; name: string; email: string; }>;
}

const NewSubjectCreationForm: React.FC<NewSubjectCreationFormProps> = ({
  onSuccess,
  onCancel,
  classes,
  teachers
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      credit_hours: 1,
      assessment_weight: 100,
      is_active: true,
      curriculum: 'cbc',
      category: 'core'
    }
  });

  const watchedValues = watch();

  const onSubmit = async (data: SubjectFormData) => {
    if (!schoolId) {
      setSubmitError('No school context found. Please refresh the page.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    
    console.log('📚 NewSubjectCreationForm: Submitting subject data:', data);

    try {
      // Use the SubjectDatabaseService for creation
      const newSubject = await SubjectDatabaseService.createSubject(schoolId, {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        curriculum: data.curriculum,
        category: data.category,
        class_id: data.class_id || undefined,
        teacher_id: data.teacher_id || undefined,
        credit_hours: data.credit_hours,
        assessment_weight: data.assessment_weight,
        description: data.description?.trim() || undefined,
        is_active: data.is_active
      });

      console.log('✅ Subject created successfully:', newSubject);
      
      toast({
        title: "Subject Created Successfully!",
        description: `${newSubject.name} (${newSubject.code}) has been created and is now available.`,
      });

      // Reset form and call success callback
      reset();
      onSuccess?.();

    } catch (error: any) {
      console.error('❌ Error creating subject:', error);
      
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMessage);
      
      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          Create New Subject
        </CardTitle>
        <p className="text-gray-600 ml-11">
          Add a new subject to your school's curriculum
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Mathematics"
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Subject Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., MATH101"
                  {...register('code')}
                  className={errors.code ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.code && (
                  <p className="text-sm text-red-600">{errors.code.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="curriculum">Curriculum Type *</Label>
                <Select
                  value={watchedValues.curriculum}
                  onValueChange={(value) => setValue('curriculum', value as 'cbc' | 'igcse')}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={errors.curriculum ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select curriculum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbc">CBC (Competency Based Curriculum)</SelectItem>
                    <SelectItem value="igcse">IGCSE (International General Certificate)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.curriculum && (
                  <p className="text-sm text-red-600">{errors.curriculum.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={watchedValues.category}
                  onValueChange={(value) => setValue('category', value as 'core' | 'elective' | 'optional')}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">Core Subject</SelectItem>
                    <SelectItem value="elective">Elective Subject</SelectItem>
                    <SelectItem value="optional">Optional Subject</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Assignment Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class_id">Assign to Class (Optional)</Label>
                <Select
                  value={watchedValues.class_id || ''}
                  onValueChange={(value) => setValue('class_id', value || undefined)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No class assignment</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher_id">Assign Teacher (Optional)</Label>
                <Select
                  value={watchedValues.teacher_id || ''}
                  onValueChange={(value) => setValue('teacher_id', value || undefined)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No teacher assignment</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Academic Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Academic Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credit_hours">Credit Hours *</Label>
                <Input
                  id="credit_hours"
                  type="number"
                  min="1"
                  max="10"
                  {...register('credit_hours', { valueAsNumber: true })}
                  className={errors.credit_hours ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.credit_hours && (
                  <p className="text-sm text-red-600">{errors.credit_hours.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessment_weight">Assessment Weight (%) *</Label>
                <Input
                  id="assessment_weight"
                  type="number"
                  min="1"
                  max="100"
                  {...register('assessment_weight', { valueAsNumber: true })}
                  className={errors.assessment_weight ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.assessment_weight && (
                  <p className="text-sm text-red-600">{errors.assessment_weight.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter subject description, objectives, or notes..."
                rows={3}
                {...register('description')}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={watchedValues.is_active}
                onCheckedChange={(checked) => setValue('is_active', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="is_active">Subject is Active</Label>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Subject
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewSubjectCreationForm;
