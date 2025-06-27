
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import StudentPerformanceChart from './school-owner/StudentPerformanceChart';
import AttendanceTrendsChart from './school-owner/AttendanceTrendsChart';
import FinancialBreakdownChart from './school-owner/FinancialBreakdownChart';
import SchoolPerformanceSummary from './school-owner/SchoolPerformanceSummary';

interface SchoolOwnerAnalyticsProps {
  filters: {
    term: string;
    class: string;
  };
}

const SchoolOwnerAnalytics = ({ filters }: SchoolOwnerAnalyticsProps) => {
  const { schoolId, isReady } = useSchoolScopedData();
  const { stats, loading: principalLoading, error: principalError } = usePrincipalDashboardData(0);
  const { data: financeData, isLoading: financeLoading, error: financeError } = useFinanceOfficerAnalytics(filters);
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsData(schoolId);

  // Ensure we have the school context ready
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-600">Loading school context...</p>
      </div>
    );
  }

  const loading = principalLoading || financeLoading || analyticsLoading;
  const error = principalError || financeError || analyticsError;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load analytics data. Please try again later.
          <br />
          <small>{typeof error === 'string' ? error : error?.message}</small>
        </AlertDescription>
      </Alert>
    );
  }

  // Ensure we have basic stats data
  const safeStats = {
    totalStudents: stats?.totalStudents || 0,
    totalTeachers: stats?.totalTeachers || 0,
    totalSubjects: stats?.totalSubjects || 0,
    totalClasses: stats?.totalClasses || 0,
    totalParents: stats?.totalParents || 0
  };

  const chartConfig = {
    students: { label: 'Students', color: '#3b82f6' },
    teachers: { label: 'Teachers', color: '#10b981' },
    revenue: { label: 'Revenue', color: '#8b5cf6' },
    collection: { label: 'Collection Rate', color: '#f59e0b' },
    performance: { label: 'Performance', color: '#ef4444' },
    attendance: { label: 'Attendance', color: '#06b6d4' },
  };

  // Student Performance Data (Bar Chart)
  const performanceData = [
    { subject: 'Mathematics', average: analytics?.averageGrade || 75, students: Math.floor(safeStats.totalStudents * 0.8) },
    { subject: 'English', average: (analytics?.averageGrade || 75) + 5, students: Math.floor(safeStats.totalStudents * 0.85) },
    { subject: 'Science', average: (analytics?.averageGrade || 75) - 3, students: Math.floor(safeStats.totalStudents * 0.78) },
    { subject: 'Social Studies', average: (analytics?.averageGrade || 75) + 2, students: Math.floor(safeStats.totalStudents * 0.82) },
    { subject: 'Kiswahili', average: (analytics?.averageGrade || 75) + 8, students: Math.floor(safeStats.totalStudents * 0.88) },
  ];

  // Attendance Trends (Line Graph)
  const attendanceTrends = analytics?.monthlyAttendance?.map((item, index) => ({
    month: item.month,
    attendance: item.rate,
    target: 90,
    students: safeStats.totalStudents - (index * 2),
  })) || [
    { month: 'Jan', attendance: 92, target: 90, students: safeStats.totalStudents },
    { month: 'Feb', attendance: 88, target: 90, students: safeStats.totalStudents - 2 },
    { month: 'Mar', attendance: 94, target: 90, students: safeStats.totalStudents - 1 },
    { month: 'Apr', attendance: 89, target: 90, students: safeStats.totalStudents - 3 },
    { month: 'May', attendance: 91, target: 90, students: safeStats.totalStudents - 2 },
    { month: 'Jun', attendance: 87, target: 90, students: safeStats.totalStudents - 4 },
  ];

  // Financial Breakdown (Pie Chart)
  const financialBreakdown = [
    { 
      category: 'Tuition Fees', 
      amount: (financeData?.keyMetrics?.totalCollected || 500000) * 0.7,
      color: '#3b82f6'
    },
    { 
      category: 'Activity Fees', 
      amount: (financeData?.keyMetrics?.totalCollected || 500000) * 0.15,
      color: '#10b981'
    },
    { 
      category: 'Transport Fees', 
      amount: (financeData?.keyMetrics?.totalCollected || 500000) * 0.1,
      color: '#f59e0b'
    },
    { 
      category: 'Other Fees', 
      amount: (financeData?.keyMetrics?.totalCollected || 500000) * 0.05,
      color: '#ef4444'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Three Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StudentPerformanceChart 
          performanceData={performanceData}
          chartConfig={chartConfig}
        />
        
        <AttendanceTrendsChart 
          attendanceTrends={attendanceTrends}
          chartConfig={chartConfig}
        />
        
        <FinancialBreakdownChart 
          financialBreakdown={financialBreakdown}
          chartConfig={chartConfig}
        />
      </div>

      {/* Key Metrics Summary */}
      <SchoolPerformanceSummary 
        analytics={analytics}
        financeData={financeData}
        safeStats={safeStats}
      />
    </div>
  );
};

export default SchoolOwnerAnalytics;
