import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AddParentModal from './AddParentModal';

interface StudentAdmissionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const StudentAdmissionModal: React.FC<StudentAdmissionModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    admission_number: '',
    roll_number: '',
    date_of_birth: '',
    gender: '',
    address: '',
    parent_contact: '',
    class_id: '',
    parent_id: '',
    parent_name: '',
    parent_email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const classes = [
    { id: '1', name: 'Grade 1A' },
    { id: '2', name: 'Grade 1B' },
    { id: '3', name: 'Grade 2A' },
    { id: '4', name: 'Grade 2B' },
    { id: '5', name: 'Grade 3A' }
  ];

  // Parent modal
  const [parentModalOpen, setParentModalOpen] = useState(false);
  const [parents, setParents] = useState<{id: string, name: string, email: string}[]>([]);
  const [loadingParents, setLoadingParents] = useState(true);

  // Fetch parents on open
  useEffect(() => {
    let mounted = true;
    setLoadingParents(true);
    supabase.from('profiles')
      .select('id, name, email')
      .eq('role', 'parent')
      .then(({ data, error }) => {
        if (mounted) {
          setParents(data || []);
          setLoadingParents(false);
        }
      });
    return () => { mounted = false };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create student record (include date_of_birth and parent_id)
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          name: formData.name,
          admission_number: formData.admission_number,
          roll_number: formData.roll_number,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
          parent_contact: formData.parent_contact,
          class_id: formData.class_id,
          parent_id: formData.parent_id,
          school_id: '1' // Mock school ID
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // Link student to class in student_classes junction table
      if (formData.class_id) {
        await supabase.from('student_classes').insert({
          student_id: student.id,
          class_id: formData.class_id,
          academic_year: new Date().getFullYear().toString(),
          is_active: true
        });
      }

      // Link student to parent in parent_students
      if (formData.parent_id) {
        await supabase.from('parent_students').insert({
          parent_id: formData.parent_id,
          student_id: student.id,
          relationship_type: "parent",
          is_primary_contact: true
        });
      }

      toast({
        title: "Student Admitted Successfully",
        description: `${formData.name} has been admitted with admission number ${formData.admission_number}`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error admitting student:', error);
      toast({
        title: "Admission Failed",
        description: "Failed to admit student. Please try again.",
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
    <>
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Admission</DialogTitle>
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
              <Label htmlFor="admission_number">Admission Number *</Label>
              <Input
                id="admission_number"
                value={formData.admission_number}
                onChange={(e) => handleInputChange('admission_number', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="roll_number">Roll Number</Label>
              <Input
                id="roll_number"
                value={formData.roll_number}
                onChange={(e) => handleInputChange('roll_number', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class_id">Class *</Label>
              <Select value={formData.class_id} onValueChange={value => handleInputChange('class_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="parent_id">Parent *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.parent_id}
                  onValueChange={value => handleInputChange('parent_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingParents ? (
                      <SelectItem value="">Loading...</SelectItem>
                    ) : parents.length === 0 ? (
                      <SelectItem value="">No parents found</SelectItem>
                    ) : (
                      parents.map(parent => (
                        <SelectItem value={parent.id} key={parent.id}>
                          {parent.name} ({parent.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" variant="outline" onClick={() => setParentModalOpen(true)}>
                  + Add Parent
                </Button>
              </div>
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
              <Label htmlFor="parent_name">Parent/Guardian Name *</Label>
              <Input
                id="parent_name"
                value={formData.parent_name}
                onChange={(e) => handleInputChange('parent_name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="parent_contact">Parent Contact *</Label>
              <Input
                id="parent_contact"
                value={formData.parent_contact}
                onChange={(e) => handleInputChange('parent_contact', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Admitting...' : 'Admit Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    <AddParentModal
      open={parentModalOpen}
      onClose={() => setParentModalOpen(false)}
      onParentCreated={(newParent) => {
        setParents(parents => [...parents, newParent]);
        setFormData(prev => ({ ...prev, parent_id: newParent.id }));
        setParentModalOpen(false);
      }}
    />
    </>
  );
};

export default StudentAdmissionModal;
