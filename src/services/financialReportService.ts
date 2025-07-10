import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';

export interface FinancialReportFilters {
  dateRange: 'current_term' | 'current_year' | 'last_month' | 'last_quarter' | 'custom';
  startDate?: string;
  endDate?: string;
  classId?: string;
  term?: string;
  academicYear?: string;
  schoolId?: string;
}

export interface FinancialReportData {
  title: string;
  generatedAt: string;
  data: Record<string, unknown>[];
  summary: {
    totalRecords: number;
    totalAmount?: number;
    averageAmount?: number;
    collectionRate?: number;
    outstandingAmount?: number;
  };
  metadata: {
    schoolName?: string;
    schoolLogo?: string;
    filters: FinancialReportFilters;
  };
}

export class FinancialReportService {
  /**
   * Validate user access for financial reports
   */
  static validateUserAccess(user: AuthUser): { isValid: boolean; error?: string } {
    if (!user) {
      return { isValid: false, error: 'User authentication required' };
    }

    // Only finance officers can access financial reports
    if (user.role !== 'finance_officer') {
      return { isValid: false, error: 'Access denied: This feature is restricted to Finance Officers only' };
    }

    // Finance officers must be assigned to a school
    if (!user.school_id) {
      return { isValid: false, error: 'School assignment required for finance officers' };
    }

    // Validate school_id format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.school_id)) {
      return { isValid: false, error: 'Invalid school ID format' };
    }

    return { isValid: true };
  }

  /**
   * Validate school access for finance officers
   */
  static validateSchoolAccess(user: AuthUser, requestedSchoolId?: string): { isValid: boolean; error?: string } {
    const accessValidation = this.validateUserAccess(user);
    if (!accessValidation.isValid) {
      return accessValidation;
    }

    // If no specific school is requested, use the user's assigned school
    if (!requestedSchoolId) {
      return { isValid: true };
    }

    // Finance officers can only access their assigned school
    if (user.school_id !== requestedSchoolId) {
      return { isValid: false, error: 'Access denied: Finance officers can only access their assigned school' };
    }

    return { isValid: true };
  }

  /**
   * Get date range based on filter selection
   */
  static getDateRange(filters: FinancialReportFilters): { startDate: string; endDate: string } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (filters.dateRange) {
      case 'current_term':
        // Assume current term is last 3 months
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'current_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last_quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'custom':
        startDate = filters.startDate ? new Date(filters.startDate) : new Date(now.getFullYear(), 0, 1);
        endDate = filters.endDate ? new Date(filters.endDate) : now;
        break;
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }

  /**
   * Generate Fee Collection Summary Report
   */
  static async generateFeeCollectionSummary(schoolId: string, filters: FinancialReportFilters): Promise<FinancialReportData> {
    const { startDate, endDate } = this.getDateRange(filters);

    // First, get the fees data
    const { data: feesData, error: feesError } = await supabase
      .from('fees')
      .select('*')
      .eq('school_id', schoolId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (feesError) throw feesError;

    // Get student data separately to avoid relationship conflicts
    const studentIds = [...new Set(feesData?.map(fee => fee.student_id).filter(Boolean) || [])];
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        name,
        admission_number,
        class_id
      `)
      .in('id', studentIds);

    if (studentsError) throw studentsError;

    // Get class data separately
    const classIds = [...new Set(studentsData?.map(student => student.class_id).filter(Boolean) || [])];
    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select('id, name')
      .in('id', classIds);

    if (classesError) throw classesError;

    // Get financial transactions separately
    const feeIds = feesData?.map(fee => fee.id) || [];
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('financial_transactions')
      .select('*')
      .in('fee_id', feeIds);

    if (transactionsError) throw transactionsError;

    // Create lookup maps
    const studentsMap = new Map(studentsData?.map(student => [student.id, student]) || []);
    const classesMap = new Map(classesData?.map(cls => [cls.id, cls]) || []);
    const transactionsMap = new Map();
    
    // Group transactions by fee_id
    transactionsData?.forEach(transaction => {
      if (!transactionsMap.has(transaction.fee_id)) {
        transactionsMap.set(transaction.fee_id, []);
      }
      transactionsMap.get(transaction.fee_id).push(transaction);
    });

    const processedData = (feesData || []).map(fee => {
      const student = studentsMap.get(fee.student_id);
      const classInfo = student ? classesMap.get(student.class_id) : null;
      const transactions = transactionsMap.get(fee.id) || [];

      return {
        ...fee,
        student_name: student?.name,
        admission_number: student?.admission_number,
        class_name: classInfo?.name,
        total_transactions: transactions.length,
        total_paid: transactions.reduce((sum: number, t: { amount?: number }) => sum + (t.amount || 0), 0),
      };
    });

    const summary = this.calculateSummary(processedData);

    return {
      title: 'Fee Collection Summary Report',
      generatedAt: new Date().toISOString(),
      data: processedData,
      summary,
      metadata: await this.getSchoolMetadata(schoolId, filters),
    };
  }

  /**
   * Generate Pending Fees and Balances Report
   */
  static async generatePendingFeesBalances(schoolId: string, filters: FinancialReportFilters): Promise<FinancialReportData> {
    // Get fees data
    const { data: feesData, error: feesError } = await supabase
      .from('fees')
      .select('*')
      .eq('school_id', schoolId)
      .in('status', ['unpaid', 'partial', 'overdue']);

    if (feesError) throw feesError;

    // Get student data separately
    const studentIds = [...new Set(feesData?.map(fee => fee.student_id).filter(Boolean) || [])];
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        name,
        admission_number,
        class_id
      `)
      .in('id', studentIds);

    if (studentsError) throw studentsError;

    // Get class data separately
    const classIds = [...new Set(studentsData?.map(student => student.class_id).filter(Boolean) || [])];
    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select('id, name')
      .in('id', classIds);

    if (classesError) throw classesError;

    // Create lookup maps
    const studentsMap = new Map(studentsData?.map(student => [student.id, student]) || []);
    const classesMap = new Map(classesData?.map(cls => [cls.id, cls]) || []);

    const processedData = (feesData || []).map(fee => {
      const student = studentsMap.get(fee.student_id);
      const classInfo = student ? classesMap.get(student.class_id) : null;

      return {
        ...fee,
        student_name: student?.name,
        admission_number: student?.admission_number,
        class_name: classInfo?.name,
        outstanding_amount: (fee.amount || 0) - (fee.paid_amount || 0),
        days_overdue: fee.due_date ? Math.max(0, Math.floor((new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24))) : 0,
      };
    });

    const summary = this.calculateSummary(processedData);

    return {
      title: 'Pending Fees and Balances Report',
      generatedAt: new Date().toISOString(),
      data: processedData,
      summary,
      metadata: await this.getSchoolMetadata(schoolId, filters),
    };
  }

  /**
   * Generate Subscription Payments Report
   */
  static async generateSubscriptionPayments(schoolId: string, filters: FinancialReportFilters): Promise<FinancialReportData> {
    const { startDate, endDate } = this.getDateRange(filters);

    const { data, error } = await supabase
      .from('billing_transactions')
      .select('*')
      .eq('school_id', schoolId)
      .eq('transaction_type', 'payment')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const summary = this.calculateSummary(data || []);

    return {
      title: 'Subscription Payments Report',
      generatedAt: new Date().toISOString(),
      data: data || [],
      summary,
      metadata: await this.getSchoolMetadata(schoolId, filters),
    };
  }

  /**
   * Generate MPESA Payments Summary Report
   */
  static async generateMpesaPaymentsSummary(schoolId: string, filters: FinancialReportFilters): Promise<FinancialReportData> {
    const { startDate, endDate } = this.getDateRange(filters);

    // Get MPESA transactions
    const { data: mpesaData, error: mpesaError } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('school_id', schoolId)
      .eq('transaction_status', 'Success')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (mpesaError) throw mpesaError;

    // Get student data separately
    const studentIds = [...new Set(mpesaData?.map(transaction => transaction.student_id).filter(Boolean) || [])];
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('id, name, admission_number')
      .in('id', studentIds);

    if (studentsError) throw studentsError;

    // Create lookup map
    const studentsMap = new Map(studentsData?.map(student => [student.id, student]) || []);

    const processedData = (mpesaData || []).map(transaction => {
      const student = studentsMap.get(transaction.student_id);

      return {
        ...transaction,
        student_name: student?.name,
        admission_number: student?.admission_number,
      };
    });

    const summary = this.calculateSummary(processedData);

    return {
      title: 'MPESA Payments Summary Report',
      generatedAt: new Date().toISOString(),
      data: processedData,
      summary,
      metadata: await this.getSchoolMetadata(schoolId, filters),
    };
  }

  /**
   * Generate Setup Fee Records Report
   */
  static async generateSetupFeeRecords(schoolId: string, filters: FinancialReportFilters): Promise<FinancialReportData> {
    // Get fees data
    const { data: feesData, error: feesError } = await supabase
      .from('fees')
      .select('*')
      .eq('school_id', schoolId)
      .eq('category', 'setup');

    if (feesError) throw feesError;

    // Get student data separately
    const studentIds = [...new Set(feesData?.map(fee => fee.student_id).filter(Boolean) || [])];
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        name,
        admission_number,
        class_id
      `)
      .in('id', studentIds);

    if (studentsError) throw studentsError;

    // Get class data separately
    const classIds = [...new Set(studentsData?.map(student => student.class_id).filter(Boolean) || [])];
    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select('id, name')
      .in('id', classIds);

    if (classesError) throw classesError;

    // Create lookup maps
    const studentsMap = new Map(studentsData?.map(student => [student.id, student]) || []);
    const classesMap = new Map(classesData?.map(cls => [cls.id, cls]) || []);

    const processedData = (feesData || []).map(fee => {
      const student = studentsMap.get(fee.student_id);
      const classInfo = student ? classesMap.get(student.class_id) : null;

      return {
        ...fee,
        student_name: student?.name,
        admission_number: student?.admission_number,
        class_name: classInfo?.name,
      };
    });

    const summary = this.calculateSummary(processedData);

    return {
      title: 'Setup Fee Records Report',
      generatedAt: new Date().toISOString(),
      data: processedData,
      summary,
      metadata: await this.getSchoolMetadata(schoolId, filters),
    };
  }

  /**
   * Generate Transaction History Report
   */
  static async generateTransactionHistory(schoolId: string, filters: FinancialReportFilters): Promise<FinancialReportData> {
    const { startDate, endDate } = this.getDateRange(filters);

    // Get financial transactions
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('school_id', schoolId)
      .gte('processed_at', startDate)
      .lte('processed_at', endDate)
      .order('processed_at', { ascending: false });

    if (transactionsError) throw transactionsError;

    // Get student data separately
    const studentIds = [...new Set(transactionsData?.map(transaction => transaction.student_id).filter(Boolean) || [])];
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('id, name, admission_number')
      .in('id', studentIds);

    if (studentsError) throw studentsError;

    // Get profile data separately
    const profileIds = [...new Set(transactionsData?.map(transaction => transaction.processed_by).filter(Boolean) || [])];
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', profileIds);

    if (profilesError) throw profilesError;

    // Create lookup maps
    const studentsMap = new Map(studentsData?.map(student => [student.id, student]) || []);
    const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

    const processedData = (transactionsData || []).map(transaction => {
      const student = studentsMap.get(transaction.student_id);
      const profile = profilesMap.get(transaction.processed_by);

      return {
        ...transaction,
        student_name: student?.name,
        admission_number: student?.admission_number,
        processed_by_name: profile?.name,
      };
    });

    const summary = this.calculateSummary(processedData);

    return {
      title: 'Transaction History Report',
      generatedAt: new Date().toISOString(),
      data: processedData,
      summary,
      metadata: await this.getSchoolMetadata(schoolId, filters),
    };
  }

  /**
   * Generate Custom Date Range Financial Summary
   */
  static async generateCustomDateFinancialSummary(schoolId: string, filters: FinancialReportFilters): Promise<FinancialReportData> {
    const { startDate, endDate } = this.getDateRange(filters);

    // Get all financial data for the date range
    const [feesData, transactionsData, expensesData] = await Promise.all([
      supabase
        .from('fees')
        .select('*')
        .eq('school_id', schoolId)
        .gte('created_at', startDate)
        .lte('created_at', endDate),
      supabase
        .from('financial_transactions')
        .select('*')
        .eq('school_id', schoolId)
        .gte('processed_at', startDate)
        .lte('processed_at', endDate),
      supabase
        .from('expenses')
        .select('*')
        .eq('school_id', schoolId)
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0]),
    ]);

    if (feesData.error) throw feesData.error;
    if (transactionsData.error) throw transactionsData.error;
    if (expensesData.error) throw expensesData.error;

    const combinedData = [
      ...(feesData.data || []).map(item => ({ ...item, type: 'fee' })),
      ...(transactionsData.data || []).map(item => ({ ...item, type: 'transaction' })),
      ...(expensesData.data || []).map(item => ({ ...item, type: 'expense' })),
    ];

    const summary = this.calculateSummary(combinedData);

    return {
      title: 'Custom Date Range Financial Summary',
      generatedAt: new Date().toISOString(),
      data: combinedData,
      summary,
      metadata: await this.getSchoolMetadata(schoolId, filters),
    };
  }

  /**
   * Generate Revenue Analysis Report
   */
  static async generateRevenueAnalysis(schoolId: string, filters: FinancialReportFilters): Promise<FinancialReportData> {
    const { startDate, endDate } = this.getDateRange(filters);

    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('school_id', schoolId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    // Group by month for trend analysis
    const monthlyData = (data || []).reduce((acc: Record<string, {
      month: string;
      total_revenue: number;
      total_collected: number;
      total_outstanding: number;
      fee_count: number;
    }>, fee) => {
      const month = new Date(fee.created_at).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = {
          month,
          total_revenue: 0,
          total_collected: 0,
          total_outstanding: 0,
          fee_count: 0,
        };
      }
      acc[month].total_revenue += fee.amount || 0;
      acc[month].total_collected += fee.paid_amount || 0;
      acc[month].total_outstanding += (fee.amount || 0) - (fee.paid_amount || 0);
      acc[month].fee_count += 1;
      return acc;
    }, {});

    const processedData = Object.values(monthlyData);

    const summary = this.calculateSummary(processedData);

    return {
      title: 'Revenue Analysis Report',
      generatedAt: new Date().toISOString(),
      data: processedData,
      summary,
      metadata: await this.getSchoolMetadata(schoolId, filters),
    };
  }

  /**
   * Generate Expense Breakdown Report
   */
  static async generateExpenseBreakdown(schoolId: string, filters: FinancialReportFilters): Promise<FinancialReportData> {
    const { startDate, endDate } = this.getDateRange(filters);

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('school_id', schoolId)
      .gte('date', startDate.split('T')[0])
      .lte('date', endDate.split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;

    // Group by category
    const categoryData = (data || []).reduce((acc: Record<string, {
      category: string;
      total_amount: number;
      expense_count: number;
      expenses: unknown[];
    }>, expense) => {
      const category = expense.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          category,
          total_amount: 0,
          expense_count: 0,
          expenses: [],
        };
      }
      acc[category].total_amount += expense.amount || 0;
      acc[category].expense_count += 1;
      acc[category].expenses.push(expense);
      return acc;
    }, {});

    const processedData = Object.values(categoryData);

    const summary = this.calculateSummary(data || []);

    return {
      title: 'Expense Breakdown Report',
      generatedAt: new Date().toISOString(),
      data: processedData,
      summary,
      metadata: await this.getSchoolMetadata(schoolId, filters),
    };
  }

  /**
   * Generate Student Account Statements Report
   */
  static async generateStudentAccountStatements(schoolId: string, filters: FinancialReportFilters): Promise<FinancialReportData> {
    // Get fees data
    const { data: feesData, error: feesError } = await supabase
      .from('fees')
      .select('*')
      .eq('school_id', schoolId);

    if (feesError) throw feesError;

    // Get student data separately
    const studentIds = [...new Set(feesData?.map(fee => fee.student_id).filter(Boolean) || [])];
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        name,
        admission_number,
        class_id
      `)
      .in('id', studentIds);

    if (studentsError) throw studentsError;

    // Get class data separately
    const classIds = [...new Set(studentsData?.map(student => student.class_id).filter(Boolean) || [])];
    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select('id, name')
      .in('id', classIds);

    if (classesError) throw classesError;

    // Get financial transactions separately
    const feeIds = feesData?.map(fee => fee.id) || [];
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('financial_transactions')
      .select('*')
      .in('fee_id', feeIds);

    if (transactionsError) throw transactionsError;

    // Create lookup maps
    const studentsMap = new Map(studentsData?.map(student => [student.id, student]) || []);
    const classesMap = new Map(classesData?.map(cls => [cls.id, cls]) || []);
    const transactionsMap = new Map();
    
    // Group transactions by fee_id
    transactionsData?.forEach(transaction => {
      if (!transactionsMap.has(transaction.fee_id)) {
        transactionsMap.set(transaction.fee_id, []);
      }
      transactionsMap.get(transaction.fee_id).push(transaction);
    });

    // Group by student
    const studentData = (feesData || []).reduce((acc: Record<string, {
      student_id: string;
      student_name?: string;
      admission_number?: string;
      class_name?: string;
      total_fees: number;
      total_paid: number;
      total_outstanding: number;
      fee_count: number;
      transaction_count: number;
      fees: unknown[];
    }>, fee) => {
      const studentId = fee.student_id;
      if (!acc[studentId]) {
        acc[studentId] = {
          student_id: studentId,
          student_name: studentsMap.get(studentId)?.name,
          admission_number: studentsMap.get(studentId)?.admission_number,
          class_name: studentsMap.get(studentId)?.class_id ? classesMap.get(studentsMap.get(studentId)?.class_id)?.name : null,
          total_fees: 0,
          total_paid: 0,
          total_outstanding: 0,
          fee_count: 0,
          transaction_count: 0,
          fees: [],
        };
      }
      acc[studentId].total_fees += fee.amount || 0;
      acc[studentId].total_paid += fee.paid_amount || 0;
      acc[studentId].total_outstanding += (fee.amount || 0) - (fee.paid_amount || 0);
      acc[studentId].fee_count += 1;
      acc[studentId].transaction_count += transactionsMap.get(fee.id)?.length || 0;
      acc[studentId].fees.push(fee);
      return acc;
    }, {});

    const processedData = Object.values(studentData);

    const summary = this.calculateSummary(processedData);

    return {
      title: 'Student Account Statements Report',
      generatedAt: new Date().toISOString(),
      data: processedData,
      summary,
      metadata: await this.getSchoolMetadata(schoolId, filters),
    };
  }

  /**
   * Calculate summary statistics from data
   */
  private static calculateSummary(data: Record<string, unknown>[]): {
    totalRecords: number;
    totalAmount?: number;
    averageAmount?: number;
    collectionRate?: number;
    outstandingAmount?: number;
  } {
    const summary = {
      totalRecords: data.length,
      totalAmount: 0,
      averageAmount: 0,
      collectionRate: 0,
      outstandingAmount: 0,
    };

    if (data.length === 0) return summary;

    // Calculate amounts based on available fields
    const amounts = data.map(item => {
      if (item.amount !== undefined) return Number(item.amount) || 0;
      if (item.total_amount !== undefined) return Number(item.total_amount) || 0;
      if (item.total_revenue !== undefined) return Number(item.total_revenue) || 0;
      if (item.total_fees !== undefined) return Number(item.total_fees) || 0;
      return 0;
    });

    summary.totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
    summary.averageAmount = amounts.length > 0 ? summary.totalAmount / amounts.length : 0;

    // Calculate collection rate if we have paid amounts
    const paidAmounts = data.map(item => {
      if (item.paid_amount !== undefined) return Number(item.paid_amount) || 0;
      if (item.total_collected !== undefined) return Number(item.total_collected) || 0;
      return 0;
    });

    const totalPaid = paidAmounts.reduce((sum, amount) => sum + amount, 0);
    summary.collectionRate = summary.totalAmount > 0 ? (totalPaid / summary.totalAmount) * 100 : 0;
    summary.outstandingAmount = summary.totalAmount - totalPaid;

    return summary;
  }

  /**
   * Get school metadata
   */
  private static async getSchoolMetadata(schoolId: string, filters: FinancialReportFilters) {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('name, logo_url')
        .eq('id', schoolId)
        .single();

      if (error) throw error;

      return {
        schoolName: data.name,
        schoolLogo: data.logo_url,
        filters,
      };
    } catch (error) {
      console.error('Error fetching school metadata:', error);
      return {
        schoolName: 'Unknown School',
        schoolLogo: undefined,
        filters,
      };
    }
  }

  /**
   * Generate comprehensive financial report
   */
  static async generateReport(
    reportType: string,
    schoolId: string,
    filters: FinancialReportFilters,
    user?: AuthUser
  ): Promise<FinancialReportData> {
    // Validate user access and school permissions
    if (user) {
      const schoolAccessValidation = this.validateSchoolAccess(user, schoolId);
      if (!schoolAccessValidation.isValid) {
        throw new Error(schoolAccessValidation.error || 'Access denied');
      }
    }

    switch (reportType) {
      case 'fee_collection_summary':
        return this.generateFeeCollectionSummary(schoolId, filters);
      case 'pending_fees_balances':
        return this.generatePendingFeesBalances(schoolId, filters);
      case 'subscription_payments':
        return this.generateSubscriptionPayments(schoolId, filters);
      case 'mpesa_payments_summary':
        return this.generateMpesaPaymentsSummary(schoolId, filters);
      case 'setup_fee_records':
        return this.generateSetupFeeRecords(schoolId, filters);
      case 'transaction_history':
        return this.generateTransactionHistory(schoolId, filters);
      case 'custom_date_financial_summary':
        return this.generateCustomDateFinancialSummary(schoolId, filters);
      case 'revenue_analysis':
        return this.generateRevenueAnalysis(schoolId, filters);
      case 'expense_breakdown':
        return this.generateExpenseBreakdown(schoolId, filters);
      case 'student_account_statements':
        return this.generateStudentAccountStatements(schoolId, filters);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
} 