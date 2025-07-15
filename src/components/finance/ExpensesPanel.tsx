import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  expensesService,
  Expense,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseFilters,
  EXPENSE_CATEGORIES,
} from "@/services/expensesService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import ExpenseStatusBadge from "./ExpenseStatusBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  Filter,
  Download,
  FileDown,
  FileSpreadsheet,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Receipt,
  Loader2,
  AlertCircle,
  BarChart3,
} from "lucide-react";

const ExpensesPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [exporting, setExporting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateExpenseData>({
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    receipt_url: "",
    title: "",
  });

  // Filters state
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  // Stats state
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    categoryBreakdown: {} as Record<string, number>,
  });

  // Load expenses on mount and when filters change
  useEffect(() => {
    loadExpenses();
  }, [dateRange, selectedCategory, searchTerm]);

  // Role-based access control
  if (!user || user.role !== "finance_officer") {
    return (
      <div className="p-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only finance officers can manage expenses.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Load expenses
  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters: ExpenseFilters = {};
      if (dateRange.start && dateRange.end) {
        currentFilters.dateRange = dateRange;
      }
      if (selectedCategory) {
        currentFilters.category = selectedCategory;
      }
      if (searchTerm) {
        currentFilters.search = searchTerm;
      }

      const data = await expensesService.getExpenses(currentFilters);
      setExpenses(data);

      // Calculate stats
      const totalExpenses = data.length;
      const totalAmount = data.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      const categoryBreakdown: Record<string, number> = {};
      data.forEach((expense) => {
        categoryBreakdown[expense.category] =
          (categoryBreakdown[expense.category] || 0) + expense.amount;
      });

      setStats({
        totalExpenses,
        totalAmount,
        categoryBreakdown,
      });
    } catch (err) {
      console.error("Error loading expenses:", err);
      setError(err instanceof Error ? err.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingExpense) {
        // Update existing expense
        await expensesService.updateExpense(editingExpense.id, formData);
        toast({
          title: "Success",
          description: "Expense updated successfully",
        });
        setIsEditModalOpen(false);
      } else {
        // Create new expense
        await expensesService.createExpense(formData, user.school_id!);
        toast({
          title: "Success",
          description: "Expense created successfully",
        });
        setIsAddModalOpen(false);
      }

      // Reset form and reload data
      resetForm();
      loadExpenses();
    } catch (err) {
      console.error("Error saving expense:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save expense",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingExpense) return;

    try {
      await expensesService.deleteExpense(deletingExpense.id);
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      loadExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete expense",
        variant: "destructive",
      });
    } finally {
      setDeletingExpense(null);
    }
  };

  // Handle edit
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description || "",
      date: expense.date,
      receipt_url: expense.receipt_url || "",
      title: expense.title || "",
    });
    setIsEditModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      category: "",
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      receipt_url: "",
      title: "",
    });
    setEditingExpense(null);
  };

  // Handle export
  const handleExport = async (format: "excel" | "pdf") => {
    try {
      setExporting(true);

      const currentFilters: ExpenseFilters = {};
      if (dateRange.start && dateRange.end) {
        currentFilters.dateRange = dateRange;
      }
      if (selectedCategory) {
        currentFilters.category = selectedCategory;
      }
      if (searchTerm) {
        currentFilters.search = searchTerm;
      }

      let blob: Blob;
      let filename: string;

      if (format === "excel") {
        blob = await expensesService.exportToExcel(currentFilters);
        filename = `expenses-${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        blob = await expensesService.exportToPDF(currentFilters);
        filename = `expenses-${new Date().toISOString().split("T")[0]}.pdf`;
      }

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `Expenses exported to ${format.toUpperCase()} successfully`,
      });
    } catch (err) {
      console.error("Error exporting expenses:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to export expenses",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setDateRange({ start: "", end: "" });
    setSelectedCategory("");
    setSearchTerm("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expenses Management</h1>
          <p className="text-muted-foreground">
            Track and manage all institutional expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExpenses}</div>
            <p className="text-xs text-muted-foreground">
              Total number of expenses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSH {stats.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total expense amount
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats.categoryBreakdown).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active expense categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={selectedCategory || "all"}
                onValueChange={(value) =>
                  setSelectedCategory(value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport("excel")}
                disabled={exporting}
                className="flex items-center gap-2"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                Export Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport("pdf")}
                disabled={exporting}
                className="flex items-center gap-2"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No expenses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount (KSH)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{expense.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {expense.title || "No title"}
                          </div>
                          {expense.description && (
                            <div className="text-sm text-muted-foreground">
                              {expense.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          KSH {expense.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ExpenseStatusBadge status={expense.status || 'approved'} />
                        {expense.status === 'rejected' && expense.rejection_reason && (
                          <div className="text-xs text-red-600 mt-1">
                            {expense.rejection_reason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {expense.receipt_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(expense.receipt_url, "_blank")
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No receipt
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingExpense(expense)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Expense
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this expense?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Enter the details for the new expense.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KSH) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Expense title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Expense description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt-url">Receipt URL</Label>
                <Input
                  id="receipt-url"
                  type="url"
                  value={formData.receipt_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      receipt_url: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/receipt.pdf"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update the expense details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount (KSH) *</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Expense title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Expense description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-receipt-url">Receipt URL</Label>
                <Input
                  id="edit-receipt-url"
                  type="url"
                  value={formData.receipt_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      receipt_url: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/receipt.pdf"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesPanel;
