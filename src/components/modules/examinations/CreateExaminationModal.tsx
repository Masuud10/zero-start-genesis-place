import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { useExaminations } from "@/hooks/useExaminations";
import { useClasses } from "@/hooks/useClasses";
import { useTeachers } from "@/hooks/useTeachers";
import { CreateExaminationData } from "@/types/academic";

interface CreateExaminationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateExaminationModal: React.FC<CreateExaminationModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateExaminationData>({
    name: "",
    type: "Written",
    term: "Term 1",
    academic_year: new Date().getFullYear().toString(),
    classes: [],
    start_date: "",
    end_date: "",
    coordinator_id: "",
    remarks: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createExamination } = useExaminations();
  const { classes } = useClasses();
  const { teachers } = useTeachers();

  const handleInputChange = (
    field: keyof CreateExaminationData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClassToggle = (classId: string) => {
    setFormData((prev) => ({
      ...prev,
      classes: prev.classes.includes(classId)
        ? prev.classes.filter((id) => id !== classId)
        : [...prev.classes, classId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Exam name is required");
      return;
    }

    if (formData.classes.length === 0) {
      setError("Please select at least one target class");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      setError("Start date and end date are required");
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError("End date must be after start date");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createExamination(formData);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create examination"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: "",
        type: "Written",
        term: "Term 1",
        academic_year: new Date().getFullYear().toString(),
        classes: [],
        start_date: "",
        end_date: "",
        coordinator_id: "",
        remarks: "",
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Examination</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Exam Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Mid-Term 1, End Term 2"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Exam Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Written">Written</SelectItem>
                  <SelectItem value="Practical">Practical</SelectItem>
                  <SelectItem value="Mock">Mock</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                  <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                  <SelectItem value="End-Term">End-Term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="term">Term *</Label>
              <Select
                value={formData.term}
                onValueChange={(value) => handleInputChange("term", value)}
              >
                <SelectTrigger>
                  <SelectValue />
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
                onChange={(e) =>
                  handleInputChange("academic_year", e.target.value)
                }
                placeholder="e.g., 2025"
                min="2020"
                max="2030"
                required
              />
            </div>

            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  handleInputChange("start_date", e.target.value)
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="coordinator">Exam Coordinator (Optional)</Label>
            <Select
              value={formData.coordinator_id}
              onValueChange={(value) =>
                handleInputChange("coordinator_id", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a coordinator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Coordinator</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Target Classes *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {classes.map((classItem) => (
                <div key={classItem.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`class-${classItem.id}`}
                    checked={formData.classes.includes(classItem.id)}
                    onCheckedChange={() => handleClassToggle(classItem.id)}
                  />
                  <Label htmlFor={`class-${classItem.id}`} className="text-sm">
                    {classItem.name}
                  </Label>
                </div>
              ))}
            </div>
            {formData.classes.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                Please select at least one class
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              placeholder="Additional notes about the examination..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Examination"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExaminationModal;
