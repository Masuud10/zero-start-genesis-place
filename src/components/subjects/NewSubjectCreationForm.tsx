
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
import { BookOpen, Save, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { SubjectDatabaseService } from '@/services/subject/subjectDatabaseService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const subjectSchema = z.object({
  name: z.string()
    .min(2, 'Subject name must be at least 2 characters')
    .max(100, 'Subject name must be 100 characters or less')
    .regex(/^[a-zA-Z0-9\s\-&()]+$/, 'Subject name contains invalid characters'),
  code: z.string()
    .min(2, 'Subject code must be at least 2 characters')
    .max(20, 'Subject code must be 20 characters or less')
    .regex(/^[A-Z0-9]+$/, 'Subject code must contain only uppercase letters and numbers'),
  curriculum: z.enum(['cbc', 'igcse'], {
    required_error: 'Please select a curriculum type'
  }),
  category: z.enum(['core', 'elective', 'optional'], {
    required_error: 'Please select a category'
  }),
  class_id: z.string().optional(),
  teacher_id: z.string().optional(),
  credit_hours: z.number()
    .min(1, 'Credit hours must be at least 1')
    .max(10, 'Credit hours cannot exceed 10'),
  assessment_weight: z.number()
    .min(1, 'Assessment weight must be at least 1%')
    .max(100, 'Assessment weight cannot exceed 100%'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
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
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError
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

  // Transform code to uppercase on change
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'code' && value.code) {
        setValue('code', value.code.toUpperCase(), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const validateUniqueSubject = async (name: string, code: string) => {
    try {
      // Check for existing subjects with same name or code
      const existingSubjects = await SubjectDatabaseService.getSubjects(schoolId!);
      
      const duplicateName = existingSubjects.find(subject => 
        subject.name.toLowerCase() === name.toLowerCase()
      );
      
      const duplicateCode = existingSubjects.find(subject => 
        subject.code.toUpperCase() === code.toUpperCase()
      );

      if (duplicateName) {
        setError('name', { 
          type: 'validate', 
          message: `Subject with name "${name}" already exists in your school` 
        });
        return false;
      }

      if (duplicateCode) {
        setError('code', { 
          type: 'validate', 
          message: `Subject with code "${code}" already exists in your school` 
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating unique subject:', error);
      return true; // Allow submission if validation fails
    }
  };

  const onSubmit = async (data: SubjectFormData) => {
    if (!schoolId) {
      setSubmitError('No school context found. Please refresh the page and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    console.log('📚 NewSubjectCreationForm: Starting subject creation:', {
      schoolId,
      subjectData: data
    });

    try {
      // Validate uniqueness
      const isUnique = await validateUniqueSubject(data.name.trim(), data.code.trim());
      if (!isUnique) {
        setIsSubmitting(false);
        return;
      }

      // Prepare data for submission
      const subjectData = {
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
      };

      console.log('📚 NewSubjectCreationForm: Submitting validated data:', subjectData);

      // Create the subject using the database service
      const newSubject = await SubjectDatabaseService.createSubject(schoolId, subjectData);

      console.log('✅ Subject created successfully:', newSubject);
      
      // Show success state briefly
      setSubmitSuccess(true);
      
      // Show success toast
      toast({
        title: "Subject Created Successfully!",
        description: `${newSubject.name} (${newSubject.code}) has been created and is now available.`,
        variant: "default"
      });

      // Reset form after short delay
      setTimeout(() => {
        reset();
        setSubmitSuccess(false);
        onSuccess?.();
      }, 1500);

    } catch (error: any) {
      console.error('❌ Error creating subject:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      // Handle specific error types
      if (error.message) {
        if (error.message.includes('already exists')) {
          errorMessage = error.message;
        } else if (error.message.includes('connection') || error.message.includes('network')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to create subjects. Please contact your administrator.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSubmitError(errorMessage);
      
      toast({
        title: "Subject Creation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      reset();
      setSubmitError(null);
      setSubmitSuccess(false);
      onCancel?.();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            {submitSuccess ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <BookOpen className="w-5 h-5 text-white" />
            )}
          </div>
          {submitSuccess ? 'Subject Created Successfully!' : 'Create New Subject'}
        </CardTitle>
        <p className="text-gray-600 ml-11">
          {submitSuccess 
            ? 'The subject has been added to your school curriculum'
            : 'Add a new subject to your school\'s curriculum'
          }
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {submitSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Subject created successfully! Redirecting...
            </AlertDescription>
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
                  style={{ textTransform: 'uppercase' }}
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
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {watchedValues.description?.length || 0}/500 characters
              </p>
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
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || submitSuccess}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : submitSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Created!
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
