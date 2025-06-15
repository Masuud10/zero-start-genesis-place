
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StudentAdmissionForm from "./StudentAdmissionForm";
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

interface Class {
  id: string;
  name: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
}

interface StudentAdmissionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classes: Class[];
  parents: Parent[];
  loadingParents: boolean; // To show loading state for parents list
}

const StudentAdmissionModal: React.FC<StudentAdmissionModalProps> = ({ open, onClose, onSuccess, classes, parents, loadingParents }) => {
  const [formData, setFormData] = useState({
    name: "",
    admission_number: "",
    roll_number: "",
    date_of_birth: "",
    gender: "",
    address: "",
    parent_contact: "",
    class_id: "",
    parent_id: "",
    parent_name: "", // This field seems to be separate from the linked parent
    parent_email: "" // This field also seems separate
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!schoolId) {
      toast({
        title: "Error",
        description: "Your school is not identified. Cannot admit student.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: student, error: studentError } = await supabase
        .from("students")
        .insert({
          name: formData.name,
          admission_number: formData.admission_number,
          roll_number: formData.roll_number,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
          parent_contact: formData.parent_contact,
          class_id: formData.class_id,
          parent_id: formData.parent_id || null,
          school_id: schoolId,
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // Link student to class in junction table
      if (formData.class_id) {
        const { error: scError } = await supabase.from("student_classes").insert({
          student_id: student.id,
          class_id: formData.class_id,
          academic_year: new Date().getFullYear().toString(),
          is_active: true,
          school_id: schoolId,
        });
        if (scError) throw scError;
      }

      // Link student to parent in junction table
      if (formData.parent_id) {
        const { error: psError } = await supabase.from("parent_students").insert({
          parent_id: formData.parent_id,
          student_id: student.id,
          relationship_type: "parent",
          is_primary_contact: true,
          school_id: schoolId,
        });
        if (psError) throw psError;
      }

      toast({
        title: "Student Admitted Successfully",
        description: `${formData.name} has been admitted with admission number ${formData.admission_number}`
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error admitting student:", error);
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
    <Dialog open={open} onOpenChange={open ? onClose : undefined}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Admission</DialogTitle>
        </DialogHeader>
        <StudentAdmissionForm
          formData={formData}
          classes={classes}
          parents={parents}
          loadingParents={loadingParents}
          isSubmitting={isSubmitting}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StudentAdmissionModal;
