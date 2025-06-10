
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ParentAdmissionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ParentAdmissionModal: React.FC<ParentAdmissionModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    occupation: '',
    relationship: '',
    emergency_contact: '',
    student_name: '',
    student_admission_number: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const relationships = [
    'Father', 'Mother', 'Guardian', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create parent profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          name: formData.name,
          email: formData.email,
          role: 'parent',
          school_id: '1' // Mock school ID
        })
        .select()
        .single();

      if (profileError) throw profileError;

      toast({
        title: "Parent Registered Successfully",
        description: `${formData.name} has been registered as a parent`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error registering parent:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register parent. Please try again.",
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
          <DialogTitle>Parent Registration</DialogTitle>
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
              <Label htmlFor="relationship">Relationship to Student *</Label>
              <Select value={formData.relationship} onValueChange={(value) => handleInputChange('relationship', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((rel) => (
                    <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                value={formData.emergency_contact}
                onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="student_name">Student Name</Label>
              <Input
                id="student_name"
                value={formData.student_name}
                onChange={(e) => handleInputChange('student_name', e.target.value)}
                placeholder="If linking to existing student"
              />
            </div>

            <div>
              <Label htmlFor="student_admission_number">Student Admission Number</Label>
              <Input
                id="student_admission_number"
                value={formData.student_admission_number}
                onChange={(e) => handleInputChange('student_admission_number', e.target.value)}
                placeholder="If linking to existing student"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Parent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ParentAdmissionModal;
