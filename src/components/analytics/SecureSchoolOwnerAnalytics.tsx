
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecureAnalyticsData } from '@/hooks/useSecureAnalyticsData';
import { useSecureFinanceMetrics } from '@/hooks/finance/useSecureFinanceMetrics';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import StudentPerformanceChart from './school-owner/StudentPerformanceChart';
import AttendanceTrendsChart from './school-owner/AttendanceTrendsChart';
import FinancialBreakdownChart from './school-owner/FinancialBreakdownChart';
import SchoolPerformanceSummary from './school-owner/SchoolPerformanceSummary';

interface SecureSchoolOwnerAnalyticsProps {
  filters: {
    term: string;
    class: string;
  };
}

const SecureSchoolOwnerAnalytics = ({ filters }: SecureSchoolOwnerAnalyticsProps) => {
  const { schoolId, isReady, userRole } = useSchoolScopedData();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useSecureAnalyticsData(schoolId);
  const { metrics: financeData, isLoading: financeLoading, error: financeError } = useSecureFinanceMetrics();

  console.log('🔒 SecureSchoolOwnerAnalytics:', { 
    schoolId, 
    isReady, 
    userRole,
    analyticsLoading,
    financeLoading,
    hasAnalytics: !!analytics,
    hasFinanceData: !!financeData
  });

  // Security check: Ensure user has proper role
  if (isReady && userRole !== 'school_owner') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Access denied. This feature is only available to School Owners.
        </AlertDescription>
      </Alert>
    );
  }

  // Wait for school context to be ready
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-600">Initializing secure connection...</p>
      </div>
    );
  }

  const loading = analyticsLoading || financeLoading;
  const error = analyticsError || financeError;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-600">Loading secure analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || 'Failed to load analytics data securely. Please try again later.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Safe stats with validated data
  const safeStats = {
    totalStudents: analytics?.totalStudents || 0,
    totalTeachers: analytics?.totalTeachers || 0,
    totalSubjects: analytics?.totalSubjects || 0,
    totalClasses: analytics?.totalClasses || 0,
    totalParents: 0 // Not available in secure analytics
  };

  const chartConfig = {
    students: { label: 'Students', color: '#3b82f6' },
    teachers: { label: 'Teachers', color: '#10b981' },
    revenue: { label: 'Revenue', color: '#8b5cf6' },
    collection: { label: 'Collection Rate', color: '#f59e0b' },
    performance: { label: 'Performance', color: '#ef4444' },
    attendance: { label: 'Attendance', color: '#06b6d4' },
  };

  // Student Performance Data
  const performanceData = [
    { subject: 'Mathematics', average: analytics?.averageGrade || 75, students: Math.floor(safeStats.totalStudents * 0.8) },
    { subject: 'English', average: (analytics?.averageGrade || 75) + 5, students: Math.floor(safeStats.totalStudents * 0.85) },
    { subject: 'Science', average: (analytics?.averageGrade || 75) - 3, students: Math.floor(safeStats.totalStudents * 0.78) },
    { subject: 'Social Studies', average: (analytics?.averageGrade || 75) + 2, students: Math.floor(safeStats.totalStudents * 0.82) },
    { subject: 'Kiswahili', average: (analytics?.averageGrade || 75) + 8, students: Math.floor(safeStats.totalStudents * 0.88) },
  ];

  // Attendance Trends
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

  // Financial Breakdown
  const financialBreakdown = [
    { 
      category: 'Tuition Fees', 
      amount: (financeData?.totalCollected || 500000) * 0.7,
      color: '#3b82f6'
    },
    { 
      category: 'Activity Fees', 
      amount: (financeData?.totalCollected || 500000) * 0.15,
      color: '#10b981'
    },
    { 
      category: 'Transport Fees', 
      amount: (financeData?.totalCollected || 500000) * 0.1,
      color: '#f59e0b'
    },
    { 
      category: 'Other Fees', 
      amount: (financeData?.totalCollected || 500000) * 0.05,
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
        financeData={{ keyMetrics: financeData }}
        safeStats={safeStats}
      />
    </div>
  );
};

export default SecureSchoolOwnerAnalytics;
