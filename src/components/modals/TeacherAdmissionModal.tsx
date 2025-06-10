
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TeacherAdmissionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const TeacherAdmissionModal: React.FC<TeacherAdmissionModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject_specialization: '',
    qualification: '',
    experience_years: '',
    address: '',
    date_of_birth: '',
    employee_id: '',
    salary: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const subjects = [
    'Mathematics', 'English', 'Science', 'Social Studies', 'History',
    'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create teacher profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          name: formData.name,
          email: formData.email,
          role: 'teacher',
          school_id: '1' // Mock school ID
        })
        .select()
        .single();

      if (profileError) throw profileError;

      toast({
        title: "Teacher Added Successfully",
        description: `${formData.name} has been added as a teacher`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast({
        title: "Addition Failed",
        description: "Failed to add teacher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Teacher Registration</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="employee_id">Employee ID *</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => handleInputChange('employee_id', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="subject_specialization">Subject Specialization *</Label>
              <Select value={formData.subject_specialization} onValueChange={(value) => handleInputChange('subject_specialization', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="qualification">Highest Qualification *</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                type="number"
                value={formData.experience_years}
                onChange={(e) => handleInputChange('experience_years', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="salary">Monthly Salary</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                placeholder="e.g., 50000"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Teacher'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherAdmissionModal;
