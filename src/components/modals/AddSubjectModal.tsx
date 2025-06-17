
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { AlertCircle, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubjectCreated: () => void;
}

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ open, onClose, onSubjectCreated }) => {
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const validateForm = () => {
    if (!subjectName?.trim()) {
      setError("Subject name is required");
      return false;
    }
    
    if (!subjectCode?.trim()) {
      setError("Subject code is required");
      return false;
    }

    if (!schoolId) {
      setError("No school assignment found. Please contact your administrator.");
      return false;
    }

    if (subjectName.trim().length < 2) {
      setError("Subject name must be at least 2 characters long");
      return false;
    }

    if (subjectCode.trim().length < 2) {
      setError("Subject code must be at least 2 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log('Creating subject with data:', {
        name: subjectName.trim(),
        code: subjectCode.trim().toUpperCase(),
        school_id: schoolId
      });

      // Check for duplicate subject code in the same school
      const { data: existingSubject, error: checkError } = await supabase
        .from('subjects')
        .select('id, code')
        .eq('school_id', schoolId)
        .eq('code', subjectCode.trim().toUpperCase())
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for duplicate subject:', checkError);
        throw new Error(`Failed to validate subject code: ${checkError.message}`);
      }

      if (existingSubject) {
        setError(`A subject with code "${subjectCode.trim().toUpperCase()}" already exists in your school`);
        return;
      }

      // Create the subject - FIXED: Removed .single()
      const { data, error } = await supabase
        .from('subjects')
        .insert([{
          name: subjectName.trim(),
          code: subjectCode.trim().toUpperCase(),
          school_id: schoolId,
        }])
        .select();

      if (error) {
        console.error('Error creating subject:', error);
        
        // Handle specific database errors
        if (error.code === '23505') {
          throw new Error('A subject with this code already exists in your school');
        } else if (error.code === '23503') {
          throw new Error('Invalid school assignment. Please contact your administrator.');
        } else if (error.code === 'PGRST116') {
          throw new Error('You do not have permission to create subjects. Please contact your administrator.');
        }
        
        throw new Error(error.message || 'Failed to create subject');
      }

      console.log('Subject created successfully:', data);

      toast({
        title: "Success",
        description: `Subject "${subjectName.trim()}" created successfully`,
      });

      handleClose();
      onSubjectCreated();

    } catch (error: any) {
      console.error('Subject creation error:', error);
      const errorMessage = error.message || "Failed to create subject. Please try again.";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubjectName('');
    setSubjectCode('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Add New Subject
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subjectName">
              Subject Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subjectName"
              type="text"
              placeholder="e.g., Mathematics, English"
              value={subjectName}
              onChange={(e) => {
                setSubjectName(e.target.value);
                setError(null);
              }}
              required
              maxLength={100}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectCode">
              Subject Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subjectCode"
              type="text"
              placeholder="e.g., MATH, ENG"
              value={subjectCode}
              onChange={(e) => {
                setSubjectCode(e.target.value.toUpperCase());
                setError(null);
              }}
              required
              maxLength={10}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Code will be automatically converted to uppercase
            </p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !subjectName?.trim() || !subjectCode?.trim()}>
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating...
                </>
              ) : (
                "Create Subject"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubjectModal;
