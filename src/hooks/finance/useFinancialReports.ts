import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type ReportType = 
  | 'fee_statements' 
  | 'payment_summaries' 
  | 'outstanding_balances' 
  | 'collection_analysis'
  | 'expense_reports'
  | 'financial_summary'
  | 'monthly_revenue'
  | 'mpesa_transactions';

export interface ReportFilter {
  dateRange: 'current_term' | 'current_year' | 'last_month' | 'last_quarter' | 'custom';
  startDate?: string;
  endDate?: string;
  classId?: string;
  term?: string;
}

// Specific data types for different reports
export interface FeeStatementData {
  student_name: string;
  admission_number: string;
  class_name: string;
  fee_type: string;
  amount: number;
  paid_amount: number;
  outstanding_amount: number;
  due_date: string;
  status: string;
}

export interface PaymentSummaryData {
  date: string;
  total_payments: number;
  total_amount: number;
  payment_method: string;
  transaction_count: number;
}

export interface OutstandingBalanceData {
  student_name: string;
  admission_number: string;
  class_name: string;
  total_outstanding: number;
  days_overdue: number;
  last_payment_date?: string;
}

export interface CollectionAnalysisData {
  class_name: string;
  total_expected: number;
  total_collected: number;
  collection_rate: number;
  student_count: number;
}

export interface ExpenseReportData {
  category: string;
  amount: number;
  date: string;
  description?: string;
  payment_method?: string;
}

export interface FinancialSummaryData {
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  collection_rate: number;
  outstanding_amount: number;
  period: string;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  expenses: number;
  net_income: number;
  transaction_count: number;
}

export interface MpesaTransactionData {
  transaction_id: string;
  amount: number;
  phone_number: string;
  status: string;
  date: string;
  student_name?: string;
}

export type ReportDataType = 
  | FeeStatementData
  | PaymentSummaryData
  | OutstandingBalanceData
  | CollectionAnalysisData
  | ExpenseReportData
  | FinancialSummaryData
  | MonthlyRevenueData
  | MpesaTransactionData;

export interface ReportData {
  title: string;
  generatedAt: string;
  data: unknown[];
  summary: {
    totalRecords: number;
    totalAmount?: number;
    averageAmount?: number;
  };
}

export const useFinancialReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateReport = async (type: ReportType, filters: ReportFilter): Promise<ReportData | null> => {
    if (!user?.school_id) {
      setError('School ID is required');
      return null;
    }

    try {
      setIsGenerating(true);
      setError(null);

      console.log('📊 Generating financial report:', type, filters);

      // Calculate date range
      const { startDate, endDate } = getDateRange(filters);

      let data: unknown[] = [];
      const summary: { totalRecords: number; totalAmount?: number; averageAmount?: number } = { 
        totalRecords: 0 
      };

      switch (type) {
        case 'fee_statements':
          data = await generateFeeStatements(user.school_id, startDate, endDate, filters.classId);
          break;
        case 'payment_summaries':
          data = await generatePaymentSummaries(user.school_id, startDate, endDate);
          break;
        case 'outstanding_balances':
          data = await generateOutstandingBalances(user.school_id);
          break;
        case 'collection_analysis':
          data = await generateCollectionAnalysis(user.school_id, startDate, endDate);
          break;
        case 'expense_reports':
          data = await generateExpenseReports(user.school_id, startDate, endDate);
          break;
        case 'financial_summary': {
          const summaryData = await generateFinancialSummary(user.school_id, startDate, endDate);
          data = [summaryData]; // Wrap in array for consistency
          break;
        }
        case 'monthly_revenue':
          data = await generateMonthlyRevenue(user.school_id, startDate, endDate);
          break;
        case 'mpesa_transactions':
          data = await generateMpesaTransactions(user.school_id, startDate, endDate);
          break;
        default:
          throw new Error('Unknown report type');
      }

      // Calculate summary
      summary.totalRecords = data.length;
      
      if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null && 'amount' in data[0]) {
        const amounts = data.map(item => {
          const itemWithAmount = item as { amount?: number | string };
          return Number(itemWithAmount.amount) || 0;
        });
        summary.totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
        summary.averageAmount = amounts.length > 0 ? summary.totalAmount / amounts.length : 0;
      }

      const reportData: ReportData = {
        title: getReportTitle(type),
        generatedAt: new Date().toISOString(),
        data,
        summary
      };

      toast({
        title: "Report Generated",
        description: `${getReportTitle(type)} generated successfully with ${data.length} records`,
      });

      return reportData;

    } catch (err: unknown) {
      console.error('Error generating report:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to generate report: " + errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (reportData: ReportData, format: 'csv' | 'pdf' = 'csv') => {
    try {
      if (format === 'csv') {
        downloadAsCSV(reportData);
      } else {
        downloadAsPDF(reportData);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Download Error",
        description: "Failed to download report: " + errorMessage,
        variant: "destructive",
      });
    }
  };

  return {
    generateReport,
    downloadReport,
    isGenerating,
    error
  };
};

// Helper functions
function getDateRange(filters: ReportFilter): { startDate: string; endDate: string } {
  const now = new Date();
  let startDate: string;
  let endDate: string = now.toISOString().split('T')[0];

  switch (filters.dateRange) {
    case 'current_term':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0];
      break;
    case 'current_year':
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      break;
    case 'last_quarter':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0];
      break;
    case 'custom':
      startDate = filters.startDate || new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      endDate = filters.endDate || endDate;
      break;
    default:
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
  }

  return { startDate, endDate };
}

function getReportTitle(type: ReportType): string {
  const titles = {
    fee_statements: 'Fee Statements Report',
    payment_summaries: 'Payment Summaries Report',
    outstanding_balances: 'Outstanding Balances Report',
    collection_analysis: 'Collection Analysis Report',
    expense_reports: 'Expense Reports',
    financial_summary: 'Financial Summary Report',
    monthly_revenue: 'Monthly Revenue Report',
    mpesa_transactions: 'MPESA Transactions Report'
  };
  return titles[type] || 'Financial Report';
}

// Report generation functions
async function generateFeeStatements(schoolId: string, startDate: string, endDate: string, classId?: string) {
  let query = supabase
    .from('fees')
    .select(`
      id,
      amount,
      paid_amount,
      due_date,
      status,
      category,
      term,
      academic_year,
      student_id,
      class_id
    `)
    .eq('school_id', schoolId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .limit(500);

  if (classId) {
    query = query.eq('class_id', classId);
  }

  const { data } = await query;
  return data || [];
}

async function generatePaymentSummaries(schoolId: string, startDate: string, endDate: string) {
  const { data } = await supabase
    .from('fees')
    .select('paid_amount, paid_date, payment_method, category')
    .eq('school_id', schoolId)
    .not('paid_amount', 'is', null)
    .gte('paid_date', startDate)
    .lte('paid_date', endDate)
    .limit(500);

  return data || [];
}

async function generateOutstandingBalances(schoolId: string) {
  const { data } = await supabase
    .from('fees')
    .select(`
      id,
      amount,
      paid_amount,
      due_date,
      category,
      student_id,
      class_id
    `)
    .eq('school_id', schoolId)
    .gt('amount', 0)
    .limit(500);

  return data?.map(fee => ({
    ...fee,
    outstanding_amount: (Number(fee.amount) || 0) - (Number(fee.paid_amount) || 0)
  })) || [];
}

async function generateCollectionAnalysis(schoolId: string, startDate: string, endDate: string) {
  const { data } = await supabase
    .from('fees')
    .select('category, amount, paid_amount, paid_date')
    .eq('school_id', schoolId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .limit(500);

  return data || [];
}

async function generateExpenseReports(schoolId: string, startDate: string, endDate: string) {
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('school_id', schoolId)
    .gte('date', startDate)
    .lte('date', endDate)
    .limit(500);

  return data || [];
}

async function generateFinancialSummary(schoolId: string, startDate: string, endDate: string) {
  const [feesResult, expensesResult] = await Promise.all([
    supabase
      .from('fees')
      .select('amount, paid_amount, category')
      .eq('school_id', schoolId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .limit(300),
    
    supabase
      .from('expenses')
      .select('amount, category')
      .eq('school_id', schoolId)
      .gte('date', startDate)
      .lte('date', endDate)
      .limit(200)
  ]);

  const fees = feesResult.data || [];
  const expenses = expensesResult.data || [];

  return {
    fees_summary: {
      total_expected: fees.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0),
      total_collected: fees.reduce((sum, fee) => sum + (Number(fee.paid_amount) || 0), 0),
      collection_rate: fees.length > 0 ? (fees.reduce((sum, fee) => sum + (Number(fee.paid_amount) || 0), 0) / fees.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0)) * 100 : 0
    },
    expenses_summary: {
      total_expenses: expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0),
      expense_count: expenses.length
    },
    period: { startDate, endDate }
  };
}

async function generateMonthlyRevenue(schoolId: string, startDate: string, endDate: string) {
  const { data } = await supabase
    .from('fees')
    .select('paid_amount, paid_date')
    .eq('school_id', schoolId)
    .not('paid_amount', 'is', null)
    .gte('paid_date', startDate)
    .lte('paid_date', endDate)
    .limit(500);

  return data || [];
}

async function generateMpesaTransactions(schoolId: string, startDate: string, endDate: string) {
  const { data } = await supabase
    .from('mpesa_transactions')
    .select('*')
    .eq('school_id', schoolId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .limit(500);

  return data || [];
}

function downloadAsCSV(reportData: ReportData) {
  if (!reportData.data.length) return;

  const headers = Object.keys(reportData.data[0]);
  const csvContent = [
    headers.join(','),
    ...reportData.data.map(row => 
      headers.map(header => `"${row[header] || ''}"`).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadAsPDF(reportData: ReportData) {
  // For now, just download as text. In a real implementation, you'd use a PDF library
  const content = `${reportData.title}\nGenerated: ${new Date(reportData.generatedAt).toLocaleString()}\n\nData:\n${JSON.stringify(reportData.data, null, 2)}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}