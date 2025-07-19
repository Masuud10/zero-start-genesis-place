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
  Edit,
} from "lucide-react";
import { useBillingActions } from "@/hooks/useBillingActions";

interface BillingRecord {
  id: string;
  school_id: string;
  billing_type: "setup_fee" | "subscription_fee";
  amount: number;
  currency: string;
  billing_period_start?: string;
  billing_period_end?: string;
  student_count?: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  invoice_number: string;
  description: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  school?: {
    id: string;
    name: string;
    email: string;
  };
}

interface EditBillingRecordModalProps {
  isOpen: boolean;
  record: BillingRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditBillingRecordModal: React.FC<EditBillingRecordModalProps> = ({
  isOpen,
  record,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    due_date: "",
    status: "pending" as "pending" | "paid" | "overdue" | "cancelled",
    paid_date: "",
    payment_method: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateBillingRecord } = useBillingActions();

  // Populate form when record changes
  useEffect(() => {
    if (record && isOpen) {
      setFormData({
        amount: record.amount.toString(),
        description: record.description,
        due_date: record.due_date,
        status: record.status,
        paid_date: record.paid_date || "",
        payment_method: record.payment_method || "",
      });
      setErrors({});
    }
  }, [record, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }

    if (formData.status === "paid" && !formData.paid_date) {
      newErrors.paid_date = "Payment date is required when status is paid";
    }

    if (formData.status === "paid" && !formData.payment_method) {
      newErrors.payment_method =
        "Payment method is required when status is paid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!record || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        id: record.id,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        due_date: formData.due_date,
        status: formData.status,
        ...(formData.paid_date && { paid_date: formData.paid_date }),
        ...(formData.payment_method && {
          payment_method: formData.payment_method,
        }),
      };

      await updateBillingRecord.mutateAsync(submitData);
      onSuccess();
    } catch (error) {
      console.error("Failed to update billing record:", error);
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

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "";
    return `KES ${num.toLocaleString("en-KE")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!record) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Billing Record
          </DialogTitle>
          <DialogDescription>
            Update billing record details for {record.school?.name || "School"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Record Info Display */}
          <Alert>
            <Building2 className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div>
                  <strong>School:</strong> {record.school?.name}
                </div>
                <div>
                  <strong>Invoice:</strong> {record.invoice_number}
                </div>
                <div>
                  <strong>Type:</strong> {record.billing_type.replace("_", " ")}
                </div>
                <div>
                  <strong>Created:</strong> {formatDate(record.created_at)}
                </div>
              </div>
            </AlertDescription>
          </Alert>

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

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(
                value: "pending" | "paid" | "overdue" | "cancelled"
              ) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Details (shown when status is paid) */}
          {formData.status === "paid" && (
            <>
              {/* Payment Date */}
              <div className="space-y-2">
                <Label htmlFor="paid_date">Payment Date *</Label>
                <Input
                  id="paid_date"
                  type="date"
                  value={formData.paid_date}
                  onChange={(e) =>
                    handleInputChange("paid_date", e.target.value)
                  }
                  className={errors.paid_date ? "border-red-500" : ""}
                />
                {errors.paid_date && (
                  <p className="text-sm text-red-500">{errors.paid_date}</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method *</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) =>
                    handleInputChange("payment_method", value)
                  }
                >
                  <SelectTrigger
                    className={errors.payment_method ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-PESA</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card Payment</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_method && (
                  <p className="text-sm text-red-500">
                    {errors.payment_method}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Additional Record Info */}
          {record.billing_type === "subscription_fee" && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div>
                    <strong>Student Count:</strong> {record.student_count || 0}
                  </div>
                  {record.billing_period_start && record.billing_period_end && (
                    <>
                      <div>
                        <strong>Billing Period:</strong>{" "}
                        {formatDate(record.billing_period_start)} -{" "}
                        {formatDate(record.billing_period_end)}
                      </div>
                    </>
                  )}
                </div>
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
                  Updating...
                </>
              ) : (
                "Update Billing Record"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBillingRecordModal;
