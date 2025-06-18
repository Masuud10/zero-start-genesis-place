
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Users, User } from 'lucide-react';
import { useFees } from '@/hooks/useFees';
import { useStudents } from '@/hooks/useStudents';
import { useSchoolClasses } from '@/hooks/useSchoolClasses';
import { useToast } from '@/hooks/use-toast';

interface FeeAssignmentDialogProps {
  onSuccess?: () => void;
}

const feeCategories = [
  'tuition',
  'transport',
  'meals',
  'activities',
  'other'
];

const FeeAssignmentDialog: React.FC<FeeAssignmentDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('class');
  const [formData, setFormData] = useState({
    amount: '',
    term: '',
    category: '',
    due_date: '',
    academic_year: new Date().getFullYear().toString(),
  });
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const { assignFeeToStudents, loading } = useFees();
  const { students } = useStudents();
  const { classes } = useSchoolClasses();
  const { toast } = useToast();

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(student => student.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('Active tab:', activeTab);
    console.log('Selected class:', selectedClassId);
    console.log('Selected students:', selectedStudentIds);
    
    if (!formData.amount || !formData.term || !formData.due_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'class' && !selectedClassId) {
      toast({
        title: "Validation Error",
        description: "Please select a class",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'students' && selectedStudentIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one student",
        variant: "destructive",
      });
      return;
    }

    try {
      let studentsToAssign: string[] = [];

      if (activeTab === 'class') {
        // Get all students in the selected class
        studentsToAssign = students
          .filter(student => student.class_id === selectedClassId)
          .map(student => student.id);
        
        console.log('Students in class:', studentsToAssign);
      } else {
        // Use selected individual students
        studentsToAssign = selectedStudentIds;
        console.log('Individual students selected:', studentsToAssign);
      }

      if (studentsToAssign.length === 0) {
        toast({
          title: "No Students Found",
          description: activeTab === 'class' 
            ? "No students found in the selected class"
            : "No students selected",
          variant: "destructive",
        });
        return;
      }

      console.log('Calling assignFeeToStudents with:', {
        amount: parseFloat(formData.amount),
        term: formData.term,
        category: formData.category || 'General',
        due_date: formData.due_date,
        academic_year: formData.academic_year,
        student_ids: studentsToAssign,
      });

      const result = await assignFeeToStudents({
        amount: parseFloat(formData.amount),
        term: formData.term,
        category: formData.category || 'General',
        due_date: formData.due_date,
        academic_year: formData.academic_year,
        student_ids: studentsToAssign,
      });

      if (result.data) {
        toast({
          title: "Fees Assigned Successfully",
          description: `Fees assigned to ${studentsToAssign.length} student(s)`,
        });

        // Reset form
        setFormData({
          amount: '',
          term: '',
          category: '',
          due_date: '',
          academic_year: new Date().getFullYear().toString(),
        });
        setSelectedClassId('');
        setSelectedStudentIds([]);
        setOpen(false);
        onSuccess?.();
      } else {
        console.error('Assignment failed:', result.error);
        toast({
          title: "Assignment Failed",
          description: result.error || "Failed to assign fees. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const classStudents = students.filter(student => student.class_id === selectedClassId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Assign Fees
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Fees to Students</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="class" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assign to Class
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Assign to Students
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Fee Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="term">Term *</Label>
                <Select value={formData.term} onValueChange={(value) => setFormData({ ...formData, term: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="term-1">Term 1</SelectItem>
                    <SelectItem value="term-2">Term 2</SelectItem>
                    <SelectItem value="term-3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="academic_year">Academic Year</Label>
              <Input
                id="academic_year"
                type="text"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                placeholder="2024"
              />
            </div>

            {/* Assignment Target */}
            <TabsContent value="class" className="space-y-4">
              <div>
                <Label htmlFor="class">Select Class *</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
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
              
              {selectedClassId && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    This will assign the fee to <strong>{classStudents.length}</strong> student(s) in the selected class.
                  </p>
                  {classStudents.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Students in this class:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {classStudents.slice(0, 5).map(student => (
                          <span key={student.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {student.name}
                          </span>
                        ))}
                        {classStudents.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{classStudents.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Select Students *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllStudents}
                >
                  {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudentIds.includes(student.id)}
                      onCheckedChange={() => handleStudentToggle(student.id)}
                    />
                    <label htmlFor={student.id} className="text-sm cursor-pointer flex-1">
                      {student.name} ({student.admission_number})
                    </label>
                  </div>
                ))}
              </div>
              
              {selectedStudentIds.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Selected <strong>{selectedStudentIds.length}</strong> student(s) for fee assignment.
                  </p>
                </div>
              )}
            </TabsContent>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Fees'}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FeeAssignmentDialog;
