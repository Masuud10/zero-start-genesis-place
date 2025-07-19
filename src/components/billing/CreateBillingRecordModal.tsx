import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertTriangle,
  Building2,
  DollarSign,
  Calendar,
  Users,
} from "lucide-react";
import { useBillingActions } from "@/hooks/useBillingActions";
import { useAllSchools } from "@/hooks/useBillingManagement";

interface CreateBillingRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBillingRecordModal: React.FC<CreateBillingRecordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    school_id: "",
    billing_type: "setup_fee" as "setup_fee" | "subscription_fee",
    amount: "",
    description: "",
    due_date: "",
    student_count: "",
    billing_period_start: "",
    billing_period_end: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createBillingRecord } = useBillingActions();
  const { data: schools, isLoading: schoolsLoading } = useAllSchools();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        school_id: "",
        billing_type: "setup_fee",
        amount: "",
        description: "",
        due_date: "",
        student_count: "",
        billing_period_start: "",
        billing_period_end: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  // Set default due date to 30 days from now
  useEffect(() => {
    if (isOpen && !formData.due_date) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setFormData((prev) => ({
        ...prev,
        due_date: defaultDueDate.toISOString().split("T")[0],
      }));
    }
  }, [isOpen, formData.due_date]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.school_id) {
      newErrors.school_id = "School is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }

    if (formData.billing_type === "subscription_fee") {
      if (!formData.student_count || parseInt(formData.student_count) <= 0) {
        newErrors.student_count =
          "Student count is required for subscription fees";
      }
      if (!formData.billing_period_start) {
        newErrors.billing_period_start =
          "Billing period start is required for subscription fees";
      }
      if (!formData.billing_period_end) {
        newErrors.billing_period_end =
          "Billing period end is required for subscription fees";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        school_id: formData.school_id,
        billing_type: formData.billing_type,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        due_date: formData.due_date,
        ...(formData.billing_type === "subscription_fee" && {
          student_count: parseInt(formData.student_count),
          billing_period_start: formData.billing_period_start,
          billing_period_end: formData.billing_period_end,
        }),
      };

      await createBillingRecord.mutateAsync(submitData);
      onSuccess();
    } catch (error) {
      console.error("Failed to create billing record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const getSelectedSchool = () => {
    return schools?.find((school) => school.id === formData.school_id);
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "";
    return `KES ${num.toLocaleString("en-KE")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Create Billing Record
          </DialogTitle>
          <DialogDescription>
            Create a new billing record for a school. Fill in the required
            information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School Selection */}
          <div className="space-y-2">
            <Label htmlFor="school_id" className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              School *
            </Label>
            <Select
              value={formData.school_id}
              onValueChange={(value) => handleInputChange("school_id", value)}
            >
              <SelectTrigger
                className={errors.school_id ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {schoolsLoading ? (
                  <SelectItem value="" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading schools...
                    </div>
                  </SelectItem>
                ) : (
                  schools?.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.school_id && (
              <p className="text-sm text-red-500">{errors.school_id}</p>
            )}
          </div>

          {/* Billing Type */}
          <div className="space-y-2">
            <Label htmlFor="billing_type" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Billing Type *
            </Label>
            <Select
              value={formData.billing_type}
              onValueChange={(value: "setup_fee" | "subscription_fee") =>
                handleInputChange("billing_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="setup_fee">Setup Fee (One-time)</SelectItem>
                <SelectItem value="subscription_fee">
                  Subscription Fee (Recurring)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Amount (KES) *
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className={errors.amount ? "border-red-500" : ""}
              min="0"
              step="0.01"
            />
            {formData.amount && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(formData.amount)}
              </p>
            )}
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter billing description..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Due Date *
            </Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleInputChange("due_date", e.target.value)}
              className={errors.due_date ? "border-red-500" : ""}
            />
            {errors.due_date && (
              <p className="text-sm text-red-500">{errors.due_date}</p>
            )}
          </div>

          {/* Subscription-specific fields */}
          {formData.billing_type === "subscription_fee" && (
            <>
              {/* Student Count */}
              <div className="space-y-2">
                <Label
                  htmlFor="student_count"
                  className="flex items-center gap-1"
                >
                  <Users className="h-4 w-4" />
                  Student Count *
                </Label>
                <Input
                  id="student_count"
                  type="number"
                  placeholder="Number of students"
                  value={formData.student_count}
                  onChange={(e) =>
                    handleInputChange("student_count", e.target.value)
                  }
                  className={errors.student_count ? "border-red-500" : ""}
                  min="1"
                />
                {errors.student_count && (
                  <p className="text-sm text-red-500">{errors.student_count}</p>
                )}
              </div>

              {/* Billing Period */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billing_period_start">
                    Billing Period Start *
                  </Label>
                  <Input
                    id="billing_period_start"
                    type="date"
                    value={formData.billing_period_start}
                    onChange={(e) =>
                      handleInputChange("billing_period_start", e.target.value)
                    }
                    className={
                      errors.billing_period_start ? "border-red-500" : ""
                    }
                  />
                  {errors.billing_period_start && (
                    <p className="text-sm text-red-500">
                      {errors.billing_period_start}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing_period_end">
                    Billing Period End *
                  </Label>
                  <Input
                    id="billing_period_end"
                    type="date"
                    value={formData.billing_period_end}
                    onChange={(e) =>
                      handleInputChange("billing_period_end", e.target.value)
                    }
                    className={
                      errors.billing_period_end ? "border-red-500" : ""
                    }
                  />
                  {errors.billing_period_end && (
                    <p className="text-sm text-red-500">
                      {errors.billing_period_end}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* School Info Display */}
          {getSelectedSchool() && (
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                <strong>{getSelectedSchool()?.name}</strong>
                <br />
                Email: {getSelectedSchool()?.email}
                <br />
                Status: {getSelectedSchool()?.status || "Active"}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Billing Record"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBillingRecordModal;
