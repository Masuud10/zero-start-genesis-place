import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { SystemIntegrationService } from "@/services/integration/SystemIntegrationService";
import {
  User,
  Calendar,
  BookOpen,
  GraduationCap,
  Users,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface Class {
  id: string;
  name: string;
  level: string;
  stream?: string;
  curriculum_type: "CBC" | "IGCSE" | "Standard";
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface EnhancedStudentAdmissionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EnhancedStudentAdmissionModal: React.FC<
  EnhancedStudentAdmissionModalProps
> = ({ open, onClose, onSuccess }) => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

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
    parent_name: "",
    parent_email: "",
    emergency_contact: "",
    medical_notes: "",
    previous_school: "",
    previous_class: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Academic period data
  const [currentPeriod, setCurrentPeriod] = useState<any>(null);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Load data when modal opens
  useEffect(() => {
    if (open && schoolId) {
      loadAdmissionData();
    }
  }, [open, schoolId]);

  const loadAdmissionData = async () => {
    setLoadingData(true);
    try {
      // Load current academic period
      const periodResult =
        await SystemIntegrationService.getCurrentAcademicPeriod(schoolId!);
      if (periodResult.error) {
        toast({
          title: "Warning",
          description:
            "Could not load current academic period. Please set one first.",
          variant: "destructive",
        });
      } else {
        setCurrentPeriod(periodResult);
      }

      // Load available classes for current year
      const classesResult = await SystemIntegrationService.getAvailableClasses(
        schoolId!,
        periodResult.year?.id
      );
      if (classesResult.error) {
        toast({
          title: "Error",
          description: "Could not load available classes.",
          variant: "destructive",
        });
      } else {
        setAvailableClasses(classesResult.classes);
      }

      // Load parents - simplified query without is_active column  
      const { data: parentsData, error: parentsError } = await supabase
        .from("profiles")
        .select("id, name, email, phone")
        .eq("school_id", schoolId!)
        .eq("role", "parent")
        .order("name");

      if (parentsError) {
        toast({
          title: "Error",
          description: "Could not load parents.",
          variant: "destructive",
        });
      } else {
        setParents(parentsData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load admission data.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push("Student name is required");
    if (!formData.admission_number.trim())
      errors.push("Admission number is required");
    if (!formData.date_of_birth) errors.push("Date of birth is required");
    if (!formData.gender) errors.push("Gender is required");
    if (!formData.class_id) errors.push("Class assignment is required");
    if (!formData.parent_name.trim()) errors.push("Parent name is required");
    if (!formData.parent_contact.trim())
      errors.push("Parent contact is required");

    // Validate admission number format (optional)
    if (
      formData.admission_number &&
      !/^[A-Z0-9]+$/.test(formData.admission_number)
    ) {
      errors.push("Admission number should contain only letters and numbers");
    }

    // Validate phone number format
    if (
      formData.parent_contact &&
      !/^(\+254|0)[17]\d{8}$/.test(formData.parent_contact)
    ) {
      errors.push("Please enter a valid Kenyan phone number");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!schoolId) {
      toast({
        title: "Error",
        description: "Your school is not identified. Cannot admit student.",
        variant: "destructive",
      });
      return;
    }

    if (!currentPeriod?.year?.id || !currentPeriod?.term?.id) {
      toast({
        title: "Error",
        description:
          "No current academic period set. Please set academic year and term first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create student record
      const { data: student, error: studentError } = await supabase
        .from("students")
        .insert({
          name: formData.name,
          admission_number: formData.admission_number,
          roll_number: formData.roll_number || null,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address || null,
          parent_contact: formData.parent_contact,
          emergency_contact: formData.emergency_contact || null,
          medical_notes: formData.medical_notes || null,
          previous_school: formData.previous_school || null,
          previous_class: formData.previous_class || null,
          school_id: schoolId,
          is_active: true,
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // Enroll student in class for current academic period
      const enrollmentResult = await SystemIntegrationService.enrollStudent(
        student.id,
        formData.class_id,
        currentPeriod.year.id,
        currentPeriod.term.id
      );

      if (!enrollmentResult.success) {
        throw new Error(
          enrollmentResult.error || "Failed to enroll student in class"
        );
      }

      // Link student to parent if parent_id is provided
      if (formData.parent_id) {
        const { error: psError } = await supabase
          .from("parent_students")
          .insert({
            parent_id: formData.parent_id,
            student_id: student.id,
            relationship_type: "parent",
            is_primary_contact: true,
            school_id: schoolId,
          });
        if (psError) throw psError;
      }

      // Create fee records for the student based on class fee structure
      const { fees } = await SystemIntegrationService.getClassFeeStructure(
        formData.class_id,
        currentPeriod.term.id
      );

      if (fees && fees.length > 0) {
        const feeRecords = fees.map((fee) => ({
          student_id: student.id,
          class_id: formData.class_id,
          fee_structure_id: fee.id,
          amount: fee.amount,
          paid_amount: 0,
          status: "pending",
          due_date: fee.due_date,
          academic_year_id: currentPeriod.year.id,
          term_id: currentPeriod.term.id,
          school_id: schoolId,
        }));

        // Note: Fee records creation is commented out as table structure is not compatible
        // const { error: feeError } = await supabase
        //   .from("student_fees")
        //   .insert(feeRecords);

        // if (feeError) {
        //   console.warn("Warning: Could not create fee records:", feeError);
        // }
      }

      toast({
        title: "Student Admitted Successfully",
        description: `${formData.name} has been admitted with admission number ${formData.admission_number}`,
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error admitting student:", error);
      toast({
        title: "Admission Failed",
        description:
          error.message || "Failed to admit student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      admission_number: "",
      roll_number: "",
      date_of_birth: "",
      gender: "",
      address: "",
      parent_contact: "",
      class_id: "",
      parent_id: "",
      parent_name: "",
      parent_email: "",
      emergency_contact: "",
      medical_notes: "",
      previous_school: "",
      previous_class: "",
    });
    setValidationErrors([]);
    setSelectedClass(null);
    onClose();
  };

  const getCurriculumBadge = (curriculumType: string) => {
    switch (curriculumType) {
      case "CBC":
        return <Badge className="bg-green-100 text-green-800">CBC</Badge>;
      case "IGCSE":
        return <Badge className="bg-purple-100 text-purple-800">IGCSE</Badge>;
      case "Standard":
        return <Badge className="bg-blue-100 text-blue-800">Standard</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={open ? handleClose : undefined}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Admission
          </DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading admission data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Academic Period Info */}
            {currentPeriod && (
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                    <Calendar className="h-4 w-4" />
                    Current Academic Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {currentPeriod.year?.year_name || "Year not set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {currentPeriod.term?.term_name || "Term not set"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admission_number">Admission Number *</Label>
                    <Input
                      id="admission_number"
                      value={formData.admission_number}
                      onChange={(e) =>
                        handleInputChange(
                          "admission_number",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="e.g., 2025/001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="roll_number">Roll Number</Label>
                    <Input
                      id="roll_number"
                      value={formData.roll_number}
                      onChange={(e) =>
                        handleInputChange("roll_number", e.target.value)
                      }
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        handleInputChange("date_of_birth", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                    >
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
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Class Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="class_id">Class *</Label>
                  <Select
                    value={formData.class_id}
                    onValueChange={(value) => {
                      handleInputChange("class_id", value);
                      const selected = availableClasses.find(
                        (c) => c.id === value
                      );
                      setSelectedClass(selected || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          <div className="flex items-center gap-2">
                            <span>{cls.name}</span>
                            {getCurriculumBadge(cls.curriculum_type)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedClass && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Selected Class:</span>
                        <span>{selectedClass.name}</span>
                        {getCurriculumBadge(selectedClass.curriculum_type)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Level: {selectedClass.level}{" "}
                        {selectedClass.stream &&
                          `• Stream: ${selectedClass.stream}`}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Parent Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parent/Guardian Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parent_name">Parent/Guardian Name *</Label>
                    <Input
                      id="parent_name"
                      value={formData.parent_name}
                      onChange={(e) =>
                        handleInputChange("parent_name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent_contact">Parent Contact *</Label>
                    <Input
                      id="parent_contact"
                      value={formData.parent_contact}
                      onChange={(e) =>
                        handleInputChange("parent_contact", e.target.value)
                      }
                      placeholder="e.g., +254712345678"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent_email">Parent Email</Label>
                    <Input
                      id="parent_email"
                      type="email"
                      value={formData.parent_email}
                      onChange={(e) =>
                        handleInputChange("parent_email", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input
                      id="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={(e) =>
                        handleInputChange("emergency_contact", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Link to existing parent */}
                {parents.length > 0 && (
                  <div>
                    <Label htmlFor="parent_id">
                      Link to Existing Parent (Optional)
                    </Label>
                    <Select
                      value={formData.parent_id}
                      onValueChange={(value) =>
                        handleInputChange("parent_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select existing parent" />
                      </SelectTrigger>
                      <SelectContent>
                        {parents.map((parent) => (
                          <SelectItem value={parent.id} key={parent.id}>
                            {parent.name} ({parent.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="previous_school">Previous School</Label>
                    <Input
                      id="previous_school"
                      value={formData.previous_school}
                      onChange={(e) =>
                        handleInputChange("previous_school", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="previous_class">Previous Class</Label>
                    <Input
                      id="previous_class"
                      value={formData.previous_class}
                      onChange={(e) =>
                        handleInputChange("previous_class", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="medical_notes">Medical Notes</Label>
                  <Input
                    id="medical_notes"
                    value={formData.medical_notes}
                    onChange={(e) =>
                      handleInputChange("medical_notes", e.target.value)
                    }
                    placeholder="Any medical conditions or allergies"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !currentPeriod?.year?.id ||
                  !currentPeriod?.term?.id
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Admitting...
                  </>
                ) : (
                  "Admit Student"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedStudentAdmissionModal;
