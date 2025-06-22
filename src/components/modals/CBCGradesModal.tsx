
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { CBCGradeEntry } from '@/components/cbc/CBCGradeEntry';
import { Loader2 } from 'lucide-react';

interface CBCGradesModalProps {
  onClose: () => void;
}

export const CBCGradesModal: React.FC<CBCGradesModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showGradeEntry, setShowGradeEntry] = useState(false);

  useEffect(() => {
    loadClasses();
  }, [schoolId, user?.id]);

  const loadClasses = async () => {
    if (!schoolId || !user?.id) return;

    try {
      setLoading(true);
      let query = supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId);

      // For teachers, only show classes they're assigned to
      if (user.role === 'teacher') {
        query = query.eq('teacher_id', user.id);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setClasses(data || []);
    } catch (error: any) {
      console.error('Error loading classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (!selectedClass || !selectedTerm) {
      toast({
        title: "Missing Information",
        description: "Please select both class and term",
        variant: "destructive"
      });
      return;
    }
    setShowGradeEntry(true);
  };

  const handleSubmissionSuccess = () => {
    toast({
      title: "Success",
      description: "CBC grades submitted successfully",
    });
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading CBC grading options...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showGradeEntry) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CBC Grade Entry</DialogTitle>
          </DialogHeader>
          <CBCGradeEntry
            classId={selectedClass}
            term={selectedTerm}
            onSubmissionSuccess={handleSubmissionSuccess}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>CBC Grade Entry Setup</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="class" className="text-right">Class</Label>
            <Select onValueChange={setSelectedClass} value={selectedClass}>
              <SelectTrigger id="class" className="col-span-3">
                <SelectValue placeholder="Select Class" />
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="term" className="text-right">Term</Label>
            <Select onValueChange={setSelectedTerm} value={selectedTerm}>
              <SelectTrigger id="term" className="col-span-3">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="term1">Term 1</SelectItem>
                <SelectItem value="term2">Term 2</SelectItem>
                <SelectItem value="term3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleProceed} disabled={!selectedClass || !selectedTerm}>
            Proceed to Grade Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
