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
}

export interface CreateExpenseData {
  category: string;
  amount: number;
  description?: string;
  date: string;
  receipt_url?: string;
  title?: string;
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

      return data || [];
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
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        throw new Error('Failed to create expense');
      }

      return data;
    } catch (error) {
      console.error('ExpensesService.createExpense error:', error);
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

      return data;
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

  /**
   * Export expenses to PDF format
   */
  async exportToPDF(filters?: ExpenseFilters): Promise<Blob> {
    try {
      const expenses = await this.getExpenses(filters);
      const stats = await this.getExpenseStats(filters);
      
      // This would typically use a PDF library like jsPDF
      // For now, we'll return a simple text representation
      const pdfContent = `
        EXPENSES REPORT
        Generated on: ${new Date().toLocaleDateString()}
        
        SUMMARY:
        Total Expenses: ${stats.totalExpenses}
        Total Amount: KSH ${stats.totalAmount.toLocaleString()}
        
        DETAILS:
        ${expenses.map(expense => `
          Date: ${expense.date}
          Category: ${expense.category}
          Description: ${expense.description || 'N/A'}
          Amount: KSH ${expense.amount.toLocaleString()}
          ---
        `).join('')}
      `;

      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      return blob;
    } catch (error) {
      console.error('ExpensesService.exportToPDF error:', error);
      throw error;
    }
  }
}

export const expensesService = new ExpensesService(); 