import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Loader2 } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/use-toast";

interface ExpenseFormData {
  title: string;
  amount: string;
  category: string;
  expense_date: string;
  description: string;
}

const CreateExpenseDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: "",
    amount: "",
    category: "",
    expense_date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const { createExpense } = useExpenses();
  const { toast } = useToast();

  const expenseCategories = [
    "salaries",
    "utilities",
    "maintenance",
    "supplies",
    "transport",
    "meals",
    "activities",
    "development",
    "insurance",
    "other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.expense_date,
        description: formData.description || undefined,
      };

      const result = await createExpense(expenseData);

      if (!result) {
        throw new Error("Failed to create expense");
      }

      // Reset form and close dialog
      setFormData({
        title: "",
        amount: "",
        category: "",
        expense_date: new Date().toISOString().split("T")[0],
        description: "",
      });
      setOpen(false);
    } catch (error: unknown) {
      console.error("Error creating expense:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create expense";
      toast({
        title: "Error Creating Expense",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Expense Name *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Office Supplies"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount (KES) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expense_date">Date *</Label>
            <Input
              id="expense_date"
              type="date"
              value={formData.expense_date}
              onChange={(e) =>
                handleInputChange("expense_date", e.target.value)
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Expense"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExpenseDialog;
