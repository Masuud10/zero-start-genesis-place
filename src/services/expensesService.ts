import { supabase } from '@/integrations/supabase/client';

export interface Expense {
  id: string;
  school_id: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  title?: string;
  expense_date?: string;
  approved_by?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  approval_date?: string;
  rejection_reason?: string;
}

export interface CreateExpenseData {
  category: string;
  amount: number;
  description?: string;
  date: string;
  receipt_url?: string;
  title?: string;
  status?: 'draft' | 'pending_approval';
}

export interface UpdateExpenseData {
  category?: string;
  amount?: number;
  description?: string;
  date?: string;
  receipt_url?: string;
  title?: string;
}

export interface ExpenseFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  category?: string;
  search?: string;
}

export const EXPENSE_CATEGORIES = [
  'Utilities',
  'Salaries',
  'Repairs',
  'Transport',
  'Licenses',
  'Misc'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

class ExpensesService {
  /**
   * Get all expenses for the current school with optional filters
   */
  async getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      // Apply filters
      if (filters?.dateRange) {
        query = query
          .gte('date', filters.dateRange.start)
          .lte('date', filters.dateRange.end);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`description.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching expenses:', error);
        throw new Error('Failed to fetch expenses');
      }

      return (data || []) as Expense[];
    } catch (error) {
      console.error('ExpensesService.getExpenses error:', error);
      throw error;
    }
  }

  /**
   * Create a new expense
   */
  async createExpense(expenseData: CreateExpenseData, schoolId: string): Promise<Expense> {
    try {
      // Validate required fields
      if (!expenseData.category || !expenseData.amount || !expenseData.date) {
        throw new Error('Category, amount, and date are required');
      }

      if (expenseData.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      if (!EXPENSE_CATEGORIES.includes(expenseData.category as ExpenseCategory)) {
        throw new Error('Invalid expense category');
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expenseData,
          school_id: schoolId,
          status: expenseData.status || 'draft',
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        throw new Error('Failed to create expense');
      }

      return data as Expense;
    } catch (error) {
      console.error('ExpensesService.createExpense error:', error);
      throw error;
    }
  }

  /**
   * Submit expense for approval (Finance Officer only)
   */
  async submitExpenseForApproval(expenseData: CreateExpenseData, schoolId: string): Promise<Expense> {
    return this.createExpense({ ...expenseData, status: 'pending_approval' }, schoolId);
  }

  /**
   * Get pending expenses for approval (School Owner only)
   */
  async getPendingExpenses(): Promise<Expense[]> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending expenses:', error);
        throw new Error('Failed to fetch pending expenses');
      }

      return (data || []) as Expense[];
    } catch (error) {
      console.error('ExpensesService.getPendingExpenses error:', error);
      throw error;
    }
  }

  /**
   * Approve expense (School Owner only)
   */
  async approveExpense(id: string): Promise<Expense> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          status: 'approved',
          approval_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'pending_approval')
        .select()
        .single();

      if (error) {
        console.error('Error approving expense:', error);
        throw new Error('Failed to approve expense');
      }

      return data as Expense;
    } catch (error) {
      console.error('ExpensesService.approveExpense error:', error);
      throw error;
    }
  }

  /**
   * Reject expense (School Owner only)
   */
  async rejectExpense(id: string, rejectionReason: string): Promise<Expense> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'pending_approval')
        .select()
        .single();

      if (error) {
        console.error('Error rejecting expense:', error);
        throw new Error('Failed to reject expense');
      }

      return data as Expense;
    } catch (error) {
      console.error('ExpensesService.rejectExpense error:', error);
      throw error;
    }
  }

  /**
   * Update an existing expense
   */
  async updateExpense(id: string, updateData: UpdateExpenseData): Promise<Expense> {
    try {
      // Validate amount if provided
      if (updateData.amount !== undefined && updateData.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Validate category if provided
      if (updateData.category && !EXPENSE_CATEGORIES.includes(updateData.category as ExpenseCategory)) {
        throw new Error('Invalid expense category');
      }

      const { data, error } = await supabase
        .from('expenses')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating expense:', error);
        throw new Error('Failed to update expense');
      }

      return data as Expense;
    } catch (error) {
      console.error('ExpensesService.updateExpense error:', error);
      throw error;
    }
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting expense:', error);
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('ExpensesService.deleteExpense error:', error);
      throw error;
    }
  }

  /**
   * Get expense statistics for the current period
   */
  async getExpenseStats(filters?: ExpenseFilters): Promise<{
    totalExpenses: number;
    totalAmount: number;
    categoryBreakdown: Record<string, number>;
    monthlyBreakdown: Record<string, number>;
  }> {
    try {
      const expenses = await this.getExpenses(filters);
      
      const totalExpenses = expenses.length;
      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Category breakdown
      const categoryBreakdown: Record<string, number> = {};
      expenses.forEach(expense => {
        categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
      });

      // Monthly breakdown
      const monthlyBreakdown: Record<string, number> = {};
      expenses.forEach(expense => {
        const month = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM format
        monthlyBreakdown[month] = (monthlyBreakdown[month] || 0) + expense.amount;
      });

      return {
        totalExpenses,
        totalAmount,
        categoryBreakdown,
        monthlyBreakdown,
      };
    } catch (error) {
      console.error('ExpensesService.getExpenseStats error:', error);
      throw error;
    }
  }

  /**
   * Export expenses to Excel format
   */
  async exportToExcel(filters?: ExpenseFilters): Promise<Blob> {
    try {
      const expenses = await this.getExpenses(filters);
      
      // Create CSV content
      const headers = ['Date', 'Category', 'Description', 'Amount (KSH)', 'Receipt URL'];
      const csvContent = [
        headers.join(','),
        ...expenses.map(expense => [
          expense.date,
          expense.category,
          expense.description || '',
          expense.amount,
          expense.receipt_url || ''
        ].join(','))
      ].join('\n');

      // Convert to Blob
      const blob = new Blob([csvContent], { type: 'text/csv' });
      return blob;
    } catch (error) {
      console.error('ExpensesService.exportToExcel error:', error);
      throw error;
    }
  }

  async exportToPDF(filters?: ExpenseFilters): Promise<Blob> {
    try {
      // Import jsPDF dynamically to avoid build issues
      const { jsPDF } = await import('jspdf');
      
      const expenses = await this.getExpenses(filters);
      const stats = await this.getExpenseStats(filters);
      
      // Create PDF document
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Expenses Report', 20, 20);
      
      // Add generation date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
      
      // Add summary section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 20, 55);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Expenses: ${stats.totalExpenses}`, 20, 70);
      doc.text(`Total Amount: KES ${stats.totalAmount.toLocaleString()}`, 20, 80);
      
      // Add expenses table if jsPDF autoTable is available
      let yPosition = 100;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Expense Details', 20, yPosition);
      
      yPosition += 20;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      expenses.forEach((expense, index) => {
        if (yPosition > 280) { // Page break
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(`${index + 1}. ${expense.title || 'No title'}`, 20, yPosition);
        doc.text(`Date: ${expense.date}`, 25, yPosition + 8);
        doc.text(`Category: ${expense.category}`, 25, yPosition + 16);
        doc.text(`Amount: KES ${expense.amount.toLocaleString()}`, 25, yPosition + 24);
        if (expense.description) {
          doc.text(`Description: ${expense.description}`, 25, yPosition + 32);
          yPosition += 45;
        } else {
          yPosition += 37;
        }
      });
      
      // Convert to blob
      const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' });
      return pdfBlob;
    } catch (error) {
      console.error('ExpensesService.exportToPDF error:', error);
      // Fallback to simple text export if PDF generation fails
      const expenses = await this.getExpenses(filters);
      const stats = await this.getExpenseStats(filters);
      
      const textContent = `
EXPENSES REPORT
Generated on: ${new Date().toLocaleDateString()}

SUMMARY:
Total Expenses: ${stats.totalExpenses}
Total Amount: KES ${stats.totalAmount.toLocaleString()}

DETAILS:
${expenses.map((expense, index) => `
${index + 1}. ${expense.title || 'No title'}
   Date: ${expense.date}
   Category: ${expense.category}
   Amount: KES ${expense.amount.toLocaleString()}
   Description: ${expense.description || 'N/A'}
   Status: ${expense.status}
   ---
`).join('')}
      `;

      const blob = new Blob([textContent], { type: 'text/plain' });
      return blob;
    }
  }
}

export const expensesService = new ExpensesService(); 