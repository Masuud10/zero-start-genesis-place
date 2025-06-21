
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportFilters {
  reportType: string;
  school?: string;
  academicYear: string;
  term?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface ReportResult {
  title: string;
  data: any[];
  generatedAt: string;
  filters: ReportFilters;
  summary?: {
    totalRecords: number;
    aggregateData?: any;
  };
}

export const useReportGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportResult | null>(null);
  const { toast } = useToast();

  const generateSchoolReport = async (filters: ReportFilters): Promise<ReportResult | null> => {
    setIsGenerating(true);
    try {
      let query;
      let reportTitle = '';
      let aggregateData = {};

      switch (filters.reportType) {
        case 'grade_distribution':
          reportTitle = 'Grade Distribution Report';
          query = supabase
            .from('grades')
            .select(`
              id,
              percentage,
              letter_grade,
              term,
              academic_year:created_at,
              student:students(name, admission_number),
              subject:subjects(name, code),
              class:classes(name, level),
              school:schools(name, location)
            `)
            .eq('status', 'released')
            .gte('created_at', `${filters.academicYear}-01-01`)
            .lt('created_at', `${parseInt(filters.academicYear) + 1}-01-01`);

          if (filters.school) query = query.eq('school_id', filters.school);
          if (filters.term) query = query.eq('term', filters.term);
          break;

        case 'attendance_summary':
          reportTitle = 'Attendance Summary Report';
          query = supabase
            .from('attendance')
            .select(`
              id,
              status,
              date,
              academic_year,
              term,
              student:students(name, admission_number),
              class:classes(name, level),
              school:schools(name, location)
            `)
            .eq('academic_year', filters.academicYear);

          if (filters.school) query = query.eq('school_id', filters.school);
          if (filters.term) query = query.eq('term', filters.term);
          break;

        case 'fees_collection':
          reportTitle = 'Fees Collection Report';
          query = supabase
            .from('fees')
            .select(`
              id,
              amount,
              paid_amount,
              status,
              category,
              term,
              academic_year,
              due_date,
              student:students(name, admission_number),
              school:schools(name, location)
            `)
            .eq('academic_year', filters.academicYear);

          if (filters.school) query = query.eq('school_id', filters.school);
          if (filters.term) query = query.eq('term', filters.term);
          break;

        case 'class_performance':
          reportTitle = 'Class Performance Summary';
          query = supabase
            .from('grade_summary')
            .select(`
              *,
              student:students(name, admission_number),
              class:classes(name, level),
              school:schools(name, location)
            `)
            .eq('academic_year', filters.academicYear);

          if (filters.school) query = query.eq('school_id', filters.school);
          if (filters.term) query = query.eq('term', filters.term);
          break;

        default:
          throw new Error('Invalid report type selected');
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(1000);

      if (error) throw error;

      // Calculate aggregate data based on report type
      if (data && data.length > 0) {
        switch (filters.reportType) {
          case 'grade_distribution':
            const gradeStats = data.reduce((acc: any, record: any) => {
              const grade = record.letter_grade || 'Ungraded';
              acc[grade] = (acc[grade] || 0) + 1;
              return acc;
            }, {});
            aggregateData = {
              gradeDistribution: gradeStats,
              averagePercentage: data.reduce((sum: number, record: any) => sum + (record.percentage || 0), 0) / data.length
            };
            break;

          case 'attendance_summary':
            const attendanceStats = data.reduce((acc: any, record: any) => {
              acc[record.status] = (acc[record.status] || 0) + 1;
              return acc;
            }, {});
            aggregateData = {
              attendanceBreakdown: attendanceStats,
              attendanceRate: ((attendanceStats.present || 0) / data.length) * 100
            };
            break;

          case 'fees_collection':
            const totalFees = data.reduce((sum: number, record: any) => sum + (record.amount || 0), 0);
            const totalPaid = data.reduce((sum: number, record: any) => sum + (record.paid_amount || 0), 0);
            aggregateData = {
              totalFees,
              totalPaid,
              totalOutstanding: totalFees - totalPaid,
              collectionRate: (totalPaid / totalFees) * 100
            };
            break;
        }
      }

      const result: ReportResult = {
        title: reportTitle,
        data: data || [],
        generatedAt: new Date().toISOString(),
        filters,
        summary: {
          totalRecords: data?.length || 0,
          aggregateData
        }
      };

      setReportData(result);
      return result;

    } catch (error: any) {
      console.error('Report generation error:', error);
      toast({
        title: "Report Generation Failed",
        description: error.message || "An error occurred while generating the report.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCompanyReport = async (filters: ReportFilters): Promise<ReportResult | null> => {
    setIsGenerating(true);
    try {
      let query;
      let reportTitle = '';
      let aggregateData = {};

      switch (filters.reportType) {
        case 'schools_overview':
          reportTitle = 'Schools Overview Report';
          query = supabase
            .from('schools')
            .select(`
              id,
              name,
              location,
              email,
              phone,
              created_at,
              curriculum_type,
              principal_name
            `)
            .order('created_at', { ascending: false });
          break;

        case 'revenue_analytics':
          reportTitle = 'Revenue Analytics Report';
          query = supabase
            .from('financial_transactions')
            .select(`
              id,
              amount,
              transaction_type,
              created_at,
              academic_year,
              school:schools(name, location)
            `)
            .eq('transaction_type', 'payment')
            .gte('created_at', `${filters.academicYear}-01-01`)
            .lt('created_at', `${parseInt(filters.academicYear) + 1}-01-01`)
            .order('created_at', { ascending: false });
          break;

        case 'active_schools':
          reportTitle = 'Active vs Inactive Schools';
          query = supabase
            .from('schools')
            .select(`
              id,
              name,
              location,
              created_at,
              curriculum_type
            `);
          break;

        default:
          throw new Error('Invalid company report type selected');
      }

      const { data, error } = await query.limit(1000);

      if (error) throw error;

      // Calculate aggregate data for company reports
      if (data && data.length > 0) {
        switch (filters.reportType) {
          case 'schools_overview':
            aggregateData = {
              totalSchools: data.length,
              byLocation: data.reduce((acc: any, school: any) => {
                const location = school.location || 'Unknown';
                acc[location] = (acc[location] || 0) + 1;
                return acc;
              }, {}),
              byCurriculum: data.reduce((acc: any, school: any) => {
                const curriculum = school.curriculum_type || 'Not specified';
                acc[curriculum] = (acc[curriculum] || 0) + 1;
                return acc;
              }, {})
            };
            break;

          case 'revenue_analytics':
            const totalRevenue = data.reduce((sum: number, record: any) => sum + (parseFloat(String(record.amount)) || 0), 0);
            aggregateData = {
              totalRevenue,
              totalTransactions: data.length,
              averageTransaction: totalRevenue / data.length,
              monthlyBreakdown: data.reduce((acc: any, record: any) => {
                const month = new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                acc[month] = (acc[month] || 0) + (parseFloat(String(record.amount)) || 0);
                return acc;
              }, {})
            };
            break;
        }
      }

      const result: ReportResult = {
        title: reportTitle,
        data: data || [],
        generatedAt: new Date().toISOString(),
        filters,
        summary: {
          totalRecords: data?.length || 0,
          aggregateData
        }
      };

      setReportData(result);
      return result;

    } catch (error: any) {
      console.error('Company report generation error:', error);
      toast({
        title: "Report Generation Failed",
        description: error.message || "An error occurred while generating the company report.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
          return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearReportData = () => {
    setReportData(null);
  };

  return {
    isGenerating,
    reportData,
    generateSchoolReport,
    generateCompanyReport,
    exportToCSV,
    clearReportData
  };
};
