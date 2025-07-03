import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2, AlertCircle } from "lucide-react";
import { NewSubjectFormData } from "@/types/subject";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Class {
  id: string;
  name: string;
  curriculum_type?: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface NewSubjectCreationFormProps {
  classes: Class[];
  teachers: Teacher[];
  onSubmit: (data: NewSubjectFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const NewSubjectCreationForm: React.FC<NewSubjectCreationFormProps> = ({
  classes,
  teachers,
  onSubmit,
  isSubmitting = false,
}) => {
  // Form state
  const [formData, setFormData] = useState<NewSubjectFormData>({
    name: "",
    code: "",
    curriculum: "CBC",
    category: "core",
    class_id: "",
    teacher_id: "",
    credit_hours: 1,
    assessment_weight: 100,
    description: "",
    is_active: true,
  });

  // Get selected class curriculum
  const selectedClass = classes.find((c) => c.id === formData.class_id);
  const classCurriculum = selectedClass?.curriculum_type || "CBC";

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleInputChange = (field: keyof NewSubjectFormData, value: any) => {
    let updatedFormData = {
      ...formData,
      [field]: value,
    };

    // When class changes, update curriculum to match class curriculum
    if (field === "class_id") {
      const selectedClass = classes.find((c) => c.id === value);
      if (selectedClass?.curriculum_type) {
        // Ensure curriculum type is valid
        const validCurriculums = ["CBC", "IGCSE"] as const;
        const curriculum = validCurriculums.includes(
          selectedClass.curriculum_type as any
        )
          ? (selectedClass.curriculum_type as "CBC" | "IGCSE")
          : "CBC";
        updatedFormData.curriculum = curriculum;
      }
    }

    setFormData(updatedFormData);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Subject name is required";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Subject code is required";
    } else if (!/^[A-Z0-9]+$/.test(formData.code.toUpperCase())) {
      newErrors.code = "Subject code must contain only letters and numbers";
    }

    if (formData.credit_hours < 1 || formData.credit_hours > 10) {
      newErrors.credit_hours = "Credit hours must be between 1 and 10";
    }

    if (formData.assessment_weight < 1 || formData.assessment_weight > 100) {
      newErrors.assessment_weight =
        "Assessment weight must be between 1 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare form data for submission
      const submitData: NewSubjectFormData = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        class_id: formData.class_id || undefined,
        teacher_id: formData.teacher_id || undefined,
        description: formData.description?.trim() || undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Create New Subject
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                Subject Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Mathematics"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="flex items-center gap-1">
                Subject Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  handleInputChange("code", e.target.value.toUpperCase())
                }
                placeholder="e.g., MATH101"
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.code}
                </p>
              )}
            </div>
          </div>

          {/* Curriculum and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="curriculum">
                Curriculum
                {formData.class_id && (
                  <span className="text-xs text-muted-foreground">
                    (Auto-selected from class)
                  </span>
                )}
              </Label>
              {formData.class_id ? (
                <div className="px-3 py-2 border rounded bg-gray-50 text-gray-700">
                  {classCurriculum}
                </div>
              ) : (
                <Select
                  value={formData.curriculum}
                  onValueChange={(value: "CBC" | "IGCSE") =>
                    handleInputChange("curriculum", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBC">
                      CBC (Competency Based Curriculum)
                    </SelectItem>
                    <SelectItem value="IGCSE">IGCSE (Cambridge)</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {formData.class_id && (
                <p className="text-xs text-green-600">
                  ✓ Curriculum automatically set to match the selected class
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: "core" | "elective" | "optional") =>
                  handleInputChange("category", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core Subject</SelectItem>
                  <SelectItem value="elective">Elective Subject</SelectItem>
                  <SelectItem value="optional">Optional Subject</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class_id">Assign to Class (Optional)</Label>
              <Select
                value={formData.class_id || undefined}
                onValueChange={(value) =>
                  handleInputChange("class_id", value || "")
                }
              >
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

            <div className="space-y-2">
              <Label htmlFor="teacher_id">Assign Teacher (Optional)</Label>
              <Select
                value={formData.teacher_id || undefined}
                onValueChange={(value) =>
                  handleInputChange("teacher_id", value || "")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Credit Hours and Assessment Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credit_hours">Credit Hours</Label>
              <Input
                id="credit_hours"
                type="number"
                min="1"
                max="10"
                value={formData.credit_hours}
                onChange={(e) =>
                  handleInputChange(
                    "credit_hours",
                    parseInt(e.target.value) || 1
                  )
                }
                className={errors.credit_hours ? "border-red-500" : ""}
              />
              {errors.credit_hours && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.credit_hours}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessment_weight">Assessment Weight (%)</Label>
              <Input
                id="assessment_weight"
                type="number"
                min="1"
                max="100"
                value={formData.assessment_weight}
                onChange={(e) =>
                  handleInputChange(
                    "assessment_weight",
                    parseInt(e.target.value) || 100
                  )
                }
                className={errors.assessment_weight ? "border-red-500" : ""}
              />
              {errors.assessment_weight && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.assessment_weight}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the subject..."
              rows={3}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="is_active" className="text-base font-medium">
                Active Status
              </Label>
              <p className="text-sm text-gray-600">
                Enable this subject for current academic operations
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                handleInputChange("is_active", checked)
              }
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Subject"
              )}
            </Button>
          </div>

          {/* Error Alert */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the validation errors above before submitting.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default NewSubjectCreationForm;
