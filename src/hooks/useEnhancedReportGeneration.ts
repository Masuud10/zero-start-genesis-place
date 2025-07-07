import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedReportData, ReportFilters } from '@/services/enhancedReportService';
import { useToast } from '@/hooks/use-toast';
import { EnhancedReportService } from '@/services/enhancedReportService';

export interface ReportGenerationOptions {
  reportType: string;
  filters?: ReportFilters;
  includeCharts?: boolean;
  includeSummary?: boolean;
}

export interface ReportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UseEnhancedReportGenerationReturn {
  reportData: EnhancedReportData | null;
  isLoading: boolean;
  isGenerating: boolean;
  isExporting: boolean;
  error: string | null;
  isValid: boolean;
  validationErrors: string[];
  validationWarnings: string[];
  generateReport: (options: ReportGenerationOptions) => Promise<void>;
  exportReport: (format: 'pdf' | 'excel') => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
  clearReport: () => void;
  lastGeneratedOptions: ReportGenerationOptions | null;
  availableReports: Array<{
    value: string;
    label: string;
    description: string;
    category: string;
  }>;
}

export const useEnhancedReportGeneration = (): UseEnhancedReportGenerationReturn => {
  const [reportData, setReportData] = useState<EnhancedReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [lastGeneratedOptions, setLastGeneratedOptions] = useState<ReportGenerationOptions | null>(null);
  
  const { user } = useAuth();
  const { schoolId: userSchoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const clearReport = useCallback(() => {
    setReportData(null);
    setError(null);
    setValidationErrors([]);
    setValidationWarnings([]);
    setLastGeneratedOptions(null);
  }, []);

  const validateUserAccess = useCallback(() => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    if (!user.id) {
      throw new Error('User ID not available');
    }
    return user;
  }, [user]);

  const getSchoolInfo = useCallback(async (schoolId: string) => {
    try {
      const { data: school, error } = await supabase
        .from('schools')
        .select('name, logo_url, address, phone, email')
        .eq('id', schoolId)
        .single();

      if (error) throw error;

      return {
        id: schoolId,
        name: school?.name || 'School',
        logo: school?.logo_url,
        address: school?.address,
        phone: school?.phone,
        email: school?.email,
      };
    } catch (error) {
      console.error('Error fetching school info:', error);
      return {
        id: schoolId,
        name: 'School',
      };
    }
  }, []);

  const getUserInfo = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, role, school_id')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        name: profile?.name || 'User',
        role: profile?.role || 'user',
        schoolId: profile?.school_id,
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      return {
        name: 'User',
        role: 'user',
        schoolId: null,
      };
    }
  }, []);

  const fetchSchoolsData = useCallback(async () => {
    try {
      const { data: schools, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return schools || [];
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw new Error('Failed to fetch schools data');
    }
  }, []);

  const fetchUsersData = useCallback(async (schoolId?: string) => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      const { data: users, error } = await query;
      if (error) throw error;
      return users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users data');
    }
  }, []);

  const fetchStudentsData = useCallback(async (schoolId: string) => {
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return students || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      throw new Error('Failed to fetch students data');
    }
  }, []);

  const fetchGradesData = useCallback(async (schoolId: string, filters?: ReportFilters) => {
    try {
      let query = supabase
        .from('grades')
        .select('*')
        .eq('school_id', schoolId);

      if (filters?.classId) {
        query = query.eq('class_id', filters.classId);
      }

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }

      if (filters?.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }

      if (filters?.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      const { data: grades, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return grades || [];
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw new Error('Failed to fetch grades data');
    }
  }, []);

  const fetchAttendanceData = useCallback(async (schoolId: string, filters?: ReportFilters) => {
    try {
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('school_id', schoolId);

      if (filters?.classId) {
        query = query.eq('class_id', filters.classId);
      }

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }

      if (filters?.dateRange?.from) {
        query = query.gte('date', filters.dateRange.from.toISOString().split('T')[0]);
      }

      if (filters?.dateRange?.to) {
        query = query.lte('date', filters.dateRange.to.toISOString().split('T')[0]);
      }

      const { data: attendance, error } = await query.order('date', { ascending: false });
      if (error) throw error;
      return attendance || [];
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw new Error('Failed to fetch attendance data');
    }
  }, []);

  const fetchFeesData = useCallback(async (schoolId: string, filters?: ReportFilters) => {
    try {
      let query = supabase
        .from('fees')
        .select('*')
        .eq('school_id', schoolId);

      if (filters?.classId) {
        query = query.eq('class_id', filters.classId);
      }

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }

      const { data: fees, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return fees || [];
    } catch (error) {
      console.error('Error fetching fees:', error);
      throw new Error('Failed to fetch fees data');
    }
  }, []);

  const fetchTransactionsData = useCallback(async (filters?: ReportFilters, schoolId?: string) => {
    try {
      let query = supabase
        .from('financial_transactions')
        .select('*');

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      if (filters?.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }

      if (filters?.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      const { data: transactions, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return transactions || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transactions data');
    }
  }, []);

  const fetchMpesaTransactionsData = useCallback(async (schoolId: string, filters?: ReportFilters) => {
    try {
      let query = supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('school_id', schoolId);

      if (filters?.dateRange?.from) {
        query = query.gte('transaction_date', filters.dateRange.from.toISOString());
      }

      if (filters?.dateRange?.to) {
        query = query.lte('transaction_date', filters.dateRange.to.toISOString());
      }

      const { data: mpesaTransactions, error } = await query.order('transaction_date', { ascending: false });
      if (error) throw error;
      return mpesaTransactions || [];
    } catch (error) {
      console.error('Error fetching M-PESA transactions:', error);
      throw new Error('Failed to fetch M-PESA transactions data');
    }
  }, []);

  const validateReportData = useCallback((data: EnhancedReportData): ReportValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.title) errors.push('Report title is missing');
    if (!data.generatedAt) errors.push('Generation timestamp is missing');
    if (!data.generatedBy) errors.push('Generated by information is missing');
    if (!data.role) errors.push('User role is missing');
    if (!data.schoolInfo) errors.push('School information is missing');

    if (!data.content || Object.keys(data.content).length === 0) {
      errors.push('No report content available');
    } else {
      Object.entries(data.content).forEach(([key, contentData]) => {
        if (Array.isArray(contentData) && contentData.length === 0) {
          warnings.push(`No data available for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        }
      });
    }

    if (!data.summary || Object.keys(data.summary).length === 0) {
      warnings.push('No summary statistics available');
    }

    if (user && data.role !== user.role) {
      warnings.push(`Report was generated for ${data.role} role, but you are ${user.role}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [user]);

  const generateRoleBasedReport = useCallback(async (options: ReportGenerationOptions): Promise<EnhancedReportData> => {
    const currentUser = validateUserAccess();
    const userInfo = await getUserInfo(currentUser.id);
    const schoolId = userSchoolId || userInfo.schoolId;

    if (!schoolId) {
      throw new Error('School ID is required for report generation');
    }

    const schoolInfo = await getSchoolInfo(schoolId);
    const reportId = `${options.reportType}-${Date.now()}`;

    let content: Record<string, unknown> = {};

    switch (options.reportType) {
      case 'system-overview':
        if (userInfo.role !== 'edufam_admin') {
          throw new Error('System overview reports are only available to EduFam administrators');
        }
        content = {
          schools: await fetchSchoolsData(),
          users: await fetchUsersData(),
          transactions: await fetchTransactionsData(options.filters),
        };
        break;

      case 'school-performance':
        if (!['principal', 'school_owner', 'edufam_admin'].includes(userInfo.role)) {
          throw new Error('School performance reports are only available to principals and school owners');
        }
        content = {
          students: await fetchStudentsData(schoolId),
          grades: await fetchGradesData(schoolId, options.filters),
          attendance: await fetchAttendanceData(schoolId, options.filters),
          fees: await fetchFeesData(schoolId, options.filters),
          transactions: await fetchTransactionsData(options.filters, schoolId),
        };
        break;

      case 'academic-performance':
        if (!['teacher', 'principal', 'school_owner'].includes(userInfo.role)) {
          throw new Error('Academic performance reports are only available to teachers and principals');
        }
        content = {
          grades: await fetchGradesData(schoolId, options.filters),
          attendance: await fetchAttendanceData(schoolId, options.filters),
          students: await fetchStudentsData(schoolId),
        };
        break;

      case 'financial-overview':
        if (!['finance_officer', 'principal', 'school_owner', 'edufam_admin'].includes(userInfo.role)) {
          throw new Error('Financial overview reports are only available to finance officers and principals');
        }
        content = {
          fees: await fetchFeesData(schoolId, options.filters),
          transactions: await fetchTransactionsData(options.filters, schoolId),
          mpesaTransactions: await fetchMpesaTransactionsData(schoolId, options.filters),
        };
        break;

      case 'student-progress':
        if (!['parent', 'teacher', 'principal'].includes(userInfo.role)) {
          throw new Error('Student progress reports are only available to parents and teachers');
        }
        if (!options.filters?.studentId) {
          throw new Error('Student ID is required for student progress report');
        }
        content = {
          grades: await fetchGradesData(schoolId, options.filters),
          attendance: await fetchAttendanceData(schoolId, options.filters),
        };
        break;

      case 'attendance-summary':
        content = {
          attendance: await fetchAttendanceData(schoolId, options.filters),
          students: await fetchStudentsData(schoolId),
        };
        break;

      case 'fee-collection':
        if (!['finance_officer', 'principal', 'school_owner'].includes(userInfo.role)) {
          throw new Error('Fee collection reports are only available to finance officers and principals');
        }
        content = {
          fees: await fetchFeesData(schoolId, options.filters),
          transactions: await fetchTransactionsData(options.filters, schoolId),
          mpesaTransactions: await fetchMpesaTransactionsData(schoolId, options.filters),
        };
        break;

      default:
        throw new Error(`Unknown report type: ${options.reportType}`);
    }

    const hasData = Object.values(content).some(data => Array.isArray(data) && data.length > 0);
    if (!hasData) {
      throw new Error('No data available for the selected report type and filters');
    }

    return {
      id: reportId,
      title: getReportTitle(options.reportType),
      generatedAt: new Date().toISOString(),
      schoolInfo,
      content,
      generatedBy: userInfo.name,
      role: userInfo.role,
      filters: options.filters,
      summary: {},
    };
  }, [
    validateUserAccess,
    getUserInfo,
    userSchoolId,
    getSchoolInfo,
    fetchSchoolsData,
    fetchUsersData,
    fetchStudentsData,
    fetchGradesData,
    fetchAttendanceData,
    fetchFeesData,
    fetchTransactionsData,
    fetchMpesaTransactionsData,
  ]);

  const getReportTitle = (reportType: string): string => {
    const titles: Record<string, string> = {
      'system-overview': 'EduFam System Overview Report',
      'school-performance': 'School Performance Report',
      'academic-performance': 'Academic Performance Report',
      'financial-overview': 'Financial Overview Report',
      'student-progress': 'Student Progress Report',
      'attendance-summary': 'Attendance Summary Report',
      'fee-collection': 'Fee Collection Report',
    };
    return titles[reportType] || 'Report';
  };

  const generateReport = useCallback(async (options: ReportGenerationOptions) => {
    setIsGenerating(true);
    setError(null);
    setValidationErrors([]);
    setValidationWarnings([]);

    try {
      console.log('🔄 Generating report:', options);
      
      const reportData = await generateRoleBasedReport(options);
      
      setReportData(reportData);
      setLastGeneratedOptions(options);
      
      const totalRecords = Object.values(reportData.content).reduce((total: number, data: unknown) => {
        return total + (Array.isArray(data) ? data.length : 0);
      }, 0);
      
      toast({
        title: "✅ Report Generated Successfully",
        description: `${reportData.title} with ${totalRecords} records`,
      });

      console.log('✅ Report generated successfully:', reportData);

      const validation = validateReportData(reportData);
      setValidationErrors(validation.errors);
      setValidationWarnings(validation.warnings);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
      setError(errorMessage);
      
      toast({
        title: "❌ Report Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });

      console.error('❌ Report generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [generateRoleBasedReport, toast, validateReportData]);

  const exportReport = useCallback(async (format: 'pdf' | 'excel') => {
    if (!reportData) {
      toast({
        title: '❌ Export Failed',
        description: 'No report data available for export',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      if (format === 'pdf') {
        await EnhancedReportService.generatePDF(reportData);
      } else {
        await EnhancedReportService.generateExcel(reportData);
      }

      toast({
        title: `✅ ${format.toUpperCase()} Export Successful`,
        description: `Report has been exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      toast({
        title: `❌ ${format.toUpperCase()} Export Failed`,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [reportData, toast]);

  const refreshData = useCallback(async () => {
    if (!reportData || !lastGeneratedOptions) return;
    
    setIsLoading(true);
    try {
      const refreshedData = await generateRoleBasedReport(lastGeneratedOptions);
      setReportData(refreshedData);
      
      toast({
        title: "✅ Data Refreshed",
        description: "Report data has been updated with latest information",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [reportData, lastGeneratedOptions, generateRoleBasedReport, toast]);

  const clearError = useCallback(() => {
    setError(null);
    setValidationErrors([]);
    setValidationWarnings([]);
  }, []);

  const getAvailableReports = useCallback(() => {
    const userRole = user?.role || 'user';
    
    const baseReports = [
      {
        value: 'attendance-summary',
        label: 'Attendance Summary',
        description: 'Comprehensive attendance records and statistics',
        category: 'Academic',
      },
    ];

    const roleBasedReports = {
      edufam_admin: [
        {
          value: 'system-overview',
          label: 'System Overview',
          description: 'Complete platform statistics and analytics',
          category: 'System',
        },
        {
          value: 'school-performance',
          label: 'School Performance',
          description: 'Performance metrics across all schools',
          category: 'Analytics',
        },
        {
          value: 'financial-overview',
          label: 'Financial Overview',
          description: 'Platform-wide financial analytics',
          category: 'Financial',
        },
      ],
      principal: [
        {
          value: 'school-performance',
          label: 'School Performance',
          description: 'Comprehensive school performance metrics',
          category: 'Analytics',
        },
        {
          value: 'academic-performance',
          label: 'Academic Performance',
          description: 'Student grades and academic progress',
          category: 'Academic',
        },
        {
          value: 'financial-overview',
          label: 'Financial Overview',
          description: 'School financial status and collections',
          category: 'Financial',
        },
        {
          value: 'fee-collection',
          label: 'Fee Collection',
          description: 'Fee collection and outstanding amounts',
          category: 'Financial',
        },
      ],
      teacher: [
        {
          value: 'academic-performance',
          label: 'Academic Performance',
          description: 'Class and student academic progress',
          category: 'Academic',
        },
        {
          value: 'student-progress',
          label: 'Student Progress',
          description: 'Individual student performance tracking',
          category: 'Academic',
        },
      ],
      finance_officer: [
        {
          value: 'financial-overview',
          label: 'Financial Overview',
          description: 'Complete financial status and analytics',
          category: 'Financial',
        },
        {
          value: 'fee-collection',
          label: 'Fee Collection',
          description: 'Fee collection and outstanding amounts',
          category: 'Financial',
        },
      ],
      parent: [
        {
          value: 'student-progress',
          label: 'Student Progress',
          description: 'Individual student performance tracking',
          category: 'Academic',
        },
      ],
    };

    return [...baseReports, ...(roleBasedReports[userRole as keyof typeof roleBasedReports] || [])];
  }, [user?.role]);

  return {
    reportData,
    isLoading,
    isGenerating,
    isExporting,
    error,
    isValid: validationErrors.length === 0,
    validationErrors,
    validationWarnings,
    generateReport,
    exportReport,
    refreshData,
    clearError,
    clearReport,
    lastGeneratedOptions,
    availableReports: getAvailableReports(),
  };
}; 