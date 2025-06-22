
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FeeAssignmentDialogProps {
  mode: 'class' | 'student';
  onAssignmentComplete?: () => void;
}

const FeeAssignmentDialog: React.FC<FeeAssignmentDialogProps> = ({
  mode,
  onAssignmentComplete
}) => {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    term: '',
    academic_year: new Date().getFullYear().toString(),
    due_date: '',
    target_id: '' // class_id or student_id
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user?.school_id) {
      fetchData();
    }
  }, [open, user?.school_id]);

  const fetchData = async () => {
    try {
      if (mode === 'class') {
        const { data, error } = await supabase
          .from('classes')
          .select('id, name')
          .eq('school_id', user?.school_id);
        
        if (error) throw error;
        setClasses(data || []);
      } else {
        const { data, error } = await supabase
          .from('students')
          .select('id, name, admission_number, class_id')
          .eq('school_id', user?.school_id)
          .eq('is_active', true);
        
        if (error) throw error;
        setStudents(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.term || !formData.due_date || !formData.target_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (mode === 'class') {
        // Assign fee to all students in the class
        const { data: studentsInClass, error: studentsError } = await supabase
          .from('students')
          .select('id')
          .eq('class_id', formData.target_id)
          .eq('is_active', true);

        if (studentsError) throw studentsError;

        if (studentsInClass && studentsInClass.length > 0) {
          const feeRecords = studentsInClass.map(student => ({
            school_id: user?.school_id,
            student_id: student.id,
            class_id: formData.target_id,
            amount: parseFloat(formData.amount),
            category: formData.category,
            term: formData.term,
            academic_year: formData.academic_year,
            due_date: formData.due_date,
            status: 'pending'
          }));

          const { error: insertError } = await supabase
            .from('fees')
            .insert(feeRecords);

          if (insertError) throw insertError;

          toast({
            title: "Success",
            description: `Fee assigned to ${studentsInClass.length} students in the class`,
          });
        } else {
          toast({
            title: "Warning",
            description: "No active students found in the selected class",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Assign fee to individual student
        const student = students.find(s => s.id === formData.target_id);
        
        const { error } = await supabase
          .from('fees')
          .insert({
            school_id: user?.school_id,
            student_id: formData.target_id,
            class_id: student?.class_id,
            amount: parseFloat(formData.amount),
            category: formData.category,
            term: formData.term,
            academic_year: formData.academic_year,
            due_date: formData.due_date,
            status: 'pending'
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Fee assigned to student successfully",
        });
      }

      setOpen(false);
      setFormData({
        amount: '',
        category: '',
        term: '',
        academic_year: new Date().getFullYear().toString(),
        due_date: '',
        target_id: ''
      });
      onAssignmentComplete?.();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign fee",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Assign Fee to {mode === 'class' ? 'Class' : 'Student'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Assign Fee to {mode === 'class' ? 'Class' : 'Student'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="target">
              {mode === 'class' ? 'Select Class' : 'Select Student'} *
            </Label>
            <Select value={formData.target_id} onValueChange={(value) => setFormData({...formData, target_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${mode}`} />
              </SelectTrigger>
              <SelectContent>
                {mode === 'class' 
                  ? classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))
                  : students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.admission_number})
                      </SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Fee Amount (KES) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="Enter amount"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Fee Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tuition">Tuition Fee</SelectItem>
                <SelectItem value="transport">Transport Fee</SelectItem>
                <SelectItem value="meals">Meals Fee</SelectItem>
                <SelectItem value="activities">Activities Fee</SelectItem>
                <SelectItem value="exam">Exam Fee</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="term">Term *</Label>
            <Select value={formData.term} onValueChange={(value) => setFormData({...formData, term: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Term 1">Term 1</SelectItem>
                <SelectItem value="Term 2">Term 2</SelectItem>
                <SelectItem value="Term 3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="academic_year">Academic Year *</Label>
            <Input
              id="academic_year"
              type="number"
              value={formData.academic_year}
              onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="due_date">Due Date *</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Fee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeeAssignmentDialog;
