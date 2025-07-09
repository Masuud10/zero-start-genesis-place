import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useClasses } from "@/hooks/useClasses";
import { useParents } from "@/hooks/useParents";
import { supabase } from "@/integrations/supabase/client";
import {
  UserPlus,
  Calendar,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface AdmissionFormData {
  fullName: string;
  gender: "male" | "female";
  dateOfBirth: string;
  parentContact: string;
  parentEmail?: string;
  classId: string;
  stream?: string;
  curriculumType: "CBC" | "IGCSE" | "Standard";
  admissionNumber: string;
  academicYear: string;
  term: string;
  address?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  previousSchool?: string;
}

const StudentAdmissionTab: React.FC = () => {
  const [formData, setFormData] = useState<AdmissionFormData>({
    fullName: "",
    gender: "male",
    dateOfBirth: "",
    parentContact: "",
    parentEmail: "",
    classId: "",
    stream: "",
    curriculumType: "Standard",
    admissionNumber: "",
    academicYear: new Date().getFullYear().toString(),
    term: "Term 1",
    address: "",
    emergencyContact: "",
    medicalNotes: "",
    previousSchool: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [admissionNumberExists, setAdmissionNumberExists] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const {
    classes,
    loading: classesLoading,
    error: classesError,
    retry: retryClasses,
  } = useClasses();
  const {
    parents,
    loading: parentsLoading,
    error: parentsError,
    retry: retryParents,
  } = useParents(true);

  // Generate admission number if not provided
  const generateAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const admissionNum = `${year}${randomNum}`;
    setFormData((prev) => ({ ...prev, admissionNumber: admissionNum }));
  };

  // Check if admission number already exists
  const checkAdmissionNumber = async (admissionNumber: string) => {
    if (!admissionNumber || !schoolId) return;

    try {
      const { data, error } = await supabase
        .from("students")
        .select("id")
        .eq("admission_number", admissionNumber)
        .eq("school_id", schoolId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found"
        console.error("Error checking admission number:", error);
        return;
      }

      setAdmissionNumberExists(!!data);
    } catch (error) {
      console.error("Error checking admission number:", error);
    }
  };

  useEffect(() => {
    if (formData.admissionNumber) {
      const timeoutId = setTimeout(() => {
        checkAdmissionNumber(formData.admissionNumber);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.admissionNumber, schoolId]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.parentContact.trim()) {
      errors.parentContact = "Parent contact is required";
    }

    if (!formData.classId) {
      errors.classId = "Class is required";
    }

    if (!formData.admissionNumber.trim()) {
      errors.admissionNumber = "Admission number is required";
    } else if (admissionNumberExists) {
      errors.admissionNumber = "Admission number already exists";
    }

    if (!formData.academicYear) {
      errors.academicYear = "Academic year is required";
    }

    if (!formData.term) {
      errors.term = "Term is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    if (!schoolId) {
      toast({
        title: "Error",
        description: "School context not available.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create student record
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .insert({
          name: formData.fullName,
          admission_number: formData.admissionNumber,
          class_id: formData.classId,
          school_id: schoolId,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          parent_contact: formData.parentContact,
          emergency_contact: formData.emergencyContact,
          medical_notes: formData.medicalNotes,
          previous_school: formData.previousSchool,
          is_active: true,
          status: "active",
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // Create student class enrollment
      const { error: enrollmentError } = await supabase
        .from("student_classes")
        .insert({
          student_id: studentData.id,
          class_id: formData.classId,
          academic_year: formData.academicYear,
          school_id: schoolId,
          is_active: true,
        });

      if (enrollmentError) throw enrollmentError;

      toast({
        title: "Success",
        description: `Student ${formData.fullName} has been successfully admitted with admission number ${formData.admissionNumber}.`,
      });

      // Reset form
      setFormData({
        fullName: "",
        gender: "male",
        dateOfBirth: "",
        parentContact: "",
        parentEmail: "",
        classId: "",
        stream: "",
        curriculumType: "Standard",
        admissionNumber: "",
        academicYear: new Date().getFullYear().toString(),
        term: "Term 1",
        address: "",
        emergencyContact: "",
        medicalNotes: "",
        previousSchool: "",
      });

      setAdmissionNumberExists(false);
      setFormErrors({});

      // Refresh data
      retryClasses();
      retryParents();
    } catch (error: any) {
      console.error("Error admitting student:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to admit student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AdmissionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admission form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            Student Admission
          </h2>
          <p className="text-muted-foreground">
            Enroll new students with comprehensive information
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            retryClasses();
            retryParents();
          }}
          disabled={classesLoading || parentsLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${
              classesLoading || parentsLoading ? "animate-spin" : ""
            }`}
          />
          Refresh Data
        </Button>
      </div>

      {/* Error Alerts */}
      {(classesError || parentsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {classesError || parentsError}. Please refresh the data.
          </AlertDescription>
        </Alert>
      )}

      {/* Admission Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Enter student's full name"
                    className={formErrors.fullName ? "border-red-500" : ""}
                  />
                  {formErrors.fullName && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.fullName}
                    </p>
                  )}
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
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    className={formErrors.dateOfBirth ? "border-red-500" : ""}
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="admissionNumber">Admission Number *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="admissionNumber"
                      value={formData.admissionNumber}
                      onChange={(e) =>
                        handleInputChange("admissionNumber", e.target.value)
                      }
                      placeholder="Enter admission number"
                      className={
                        formErrors.admissionNumber ? "border-red-500" : ""
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateAdmissionNumber}
                      className="whitespace-nowrap"
                    >
                      Generate
                    </Button>
                  </div>
                  {formErrors.admissionNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.admissionNumber}
                    </p>
                  )}
                  {admissionNumberExists && (
                    <p className="text-sm text-orange-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      This admission number already exists
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="parentContact">Parent Contact *</Label>
                  <Input
                    id="parentContact"
                    value={formData.parentContact}
                    onChange={(e) =>
                      handleInputChange("parentContact", e.target.value)
                    }
                    placeholder="Enter parent phone number"
                    className={formErrors.parentContact ? "border-red-500" : ""}
                  />
                  {formErrors.parentContact && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.parentContact}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="parentEmail">Parent Email</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) =>
                      handleInputChange("parentEmail", e.target.value)
                    }
                    placeholder="Enter parent email"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      handleInputChange("emergencyContact", e.target.value)
                    }
                    placeholder="Enter emergency contact"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter student's address"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="classId">Class *</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) => handleInputChange("classId", value)}
                >
                  <SelectTrigger
                    className={formErrors.classId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.classId && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.classId}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="curriculumType">Curriculum Type *</Label>
                <Select
                  value={formData.curriculumType}
                  onValueChange={(value) =>
                    handleInputChange("curriculumType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select curriculum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBC">CBC</SelectItem>
                    <SelectItem value="IGCSE">IGCSE</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Select
                  value={formData.academicYear}
                  onValueChange={(value) =>
                    handleInputChange("academicYear", value)
                  }
                >
                  <SelectTrigger
                    className={formErrors.academicYear ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {formErrors.academicYear && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.academicYear}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="term">Term *</Label>
                <Select
                  value={formData.term}
                  onValueChange={(value) => handleInputChange("term", value)}
                >
                  <SelectTrigger
                    className={formErrors.term ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.term && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.term}</p>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="previousSchool">Previous School</Label>
                <Input
                  id="previousSchool"
                  value={formData.previousSchool}
                  onChange={(e) =>
                    handleInputChange("previousSchool", e.target.value)
                  }
                  placeholder="Enter previous school (if any)"
                />
              </div>

              <div>
                <Label htmlFor="medicalNotes">Medical Notes</Label>
                <Textarea
                  id="medicalNotes"
                  value={formData.medicalNotes}
                  onChange={(e) =>
                    handleInputChange("medicalNotes", e.target.value)
                  }
                  placeholder="Enter any medical notes or special requirements"
                  rows={3}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    fullName: "",
                    gender: "male",
                    dateOfBirth: "",
                    parentContact: "",
                    parentEmail: "",
                    classId: "",
                    stream: "",
                    curriculumType: "Standard",
                    admissionNumber: "",
                    academicYear: new Date().getFullYear().toString(),
                    term: "Term 1",
                    address: "",
                    emergencyContact: "",
                    medicalNotes: "",
                    previousSchool: "",
                  });
                  setFormErrors({});
                  setAdmissionNumberExists(false);
                }}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={submitting || admissionNumberExists}
                className="min-w-[120px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Admitting...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Admit Student
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAdmissionTab;
