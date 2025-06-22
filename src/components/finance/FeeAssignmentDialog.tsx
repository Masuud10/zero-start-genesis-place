
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Users } from 'lucide-react';

interface FeeAssignmentDialogProps {
  mode: 'class' | 'student';
  onAssignmentComplete: () => void;
}

const FeeAssignmentDialog: React.FC<FeeAssignmentDialogProps> = ({ mode, onAssignmentComplete }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    feeStructureId: '',
    classId: '',
    studentId: '',
    amount: '',
    dueDate: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user?.school_id) {
      fetchData();
    }
  }, [open, user?.school_id]);

  const fetchData = async () => {
    if (!user?.school_id) return;

    try {
      // Fetch classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('id, name, level, stream')
        .eq('school_id', user.school_id);

      // Fetch students
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name, admission_number, class_id')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      // Fetch fee structures
      const { data: feeStructuresData } = await supabase
        .from('fee_structures')
        .select('id, name, academic_year, term')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      setClasses(classesData || []);
      setStudents(studentsData || []);
      setFeeStructures(feeStructuresData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.school_id) return;

    setLoading(true);
    try {
      if (mode === 'class') {
        // Assign fee to all students in the class
        const classStudents = students.filter(s => s.class_id === formData.classId);
        
        const feeAssignments = classStudents.map(student => ({
          student_id: student.id,
          school_id: user.school_id,
          class_id: formData.classId,
          amount: parseFloat(formData.amount),
          due_date: formData.dueDate,
          term: 'Term 1', // You can make this dynamic
          academic_year: new Date().getFullYear().toString(),
          status: 'pending'
        }));

        const { error } = await supabase
          .from('fees')
          .insert(feeAssignments);

        if (error) throw error;

        toast({
          title: "Success",
          description: `Fee assigned to ${classStudents.length} students in the class`,
        });
      } else {
        // Assign fee to individual student
        const { error } = await supabase
          .from('fees')
          .insert({
            student_id: formData.studentId,
            school_id: user.school_id,
            amount: parseFloat(formData.amount),
            due_date: formData.dueDate,
            term: 'Term 1',
            academic_year: new Date().getFullYear().toString(),
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
        feeStructureId: '',
        classId: '',
        studentId: '',
        amount: '',
        dueDate: ''
      });
      onAssignmentComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {mode === 'class' ? <Users className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          Assign to {mode === 'class' ? 'Class' : 'Student'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Assign Fee to {mode === 'class' ? 'Class' : 'Student'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'class' ? (
            <div>
              <Label htmlFor="classId">Select Class *</Label>
              <Select value={formData.classId} onValueChange={(value) => setFormData({...formData, classId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.level} {cls.stream}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label htmlFor="studentId">Select Student *</Label>
              <Select value={formData.studentId} onValueChange={(value) => setFormData({...formData, studentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.admission_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="amount">Amount (KES) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
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
