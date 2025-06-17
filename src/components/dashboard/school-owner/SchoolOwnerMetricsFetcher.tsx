
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import SchoolOwnerDashboardLayout from "./SchoolOwnerDashboardLayout";
import FinancialOverviewReadOnly from "../shared/FinancialOverviewReadOnly";
import BeautifulReportGeneration from "../shared/BeautifulReportGeneration";

export interface SchoolMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  feeCollectionRate: number;
  totalRevenue: number;
  attendanceRate: number;
  outstandingFees: number;
  monthlyGrowth: number;
}

const SchoolOwnerMetricsFetcher: React.FC = () => {
  const { user } = useAuth();
  const { schoolId, isSystemAdmin } = useSchoolScopedData();
  
  const [metrics, setMetrics] = useState<SchoolMetrics>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    feeCollectionRate: 0,
    totalRevenue: 0,
    attendanceRate: 0,
    outstandingFees: 0,
    monthlyGrowth: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolMetrics = async () => {
    if (!schoolId && !isSystemAdmin) {
      setError("No school assignment found. Please contact your administrator.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("📊 SchoolOwnerMetricsFetcher: Fetching metrics for school:", schoolId);

      const targetSchoolId = schoolId || user?.school_id;

      // Fetch basic school metrics
      const [studentsRes, teachersRes, classesRes] = await Promise.all([
        supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('school_id', targetSchoolId)
          .eq('is_active', true),
        supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('school_id', targetSchoolId)
          .eq('role', 'teacher'),
        supabase
          .from('classes')
          .select('id', { count: 'exact' })
          .eq('school_id', targetSchoolId)
      ]);

      // Calculate attendance rate
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status')
        .eq('school_id', targetSchoolId);

      const totalAttendance = attendanceData?.length || 0;
      const presentCount = attendanceData?.filter(a => a.status === 'present').length || 0;
      const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

      // Calculate financial metrics
      const { data: financialData } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('school_id', targetSchoolId)
        .eq('transaction_type', 'payment');

      const totalRevenue = financialData?.reduce((sum, transaction) => sum + (transaction.amount || 0), 0) || 0;

      // Calculate fee collection rate and outstanding fees
      const { data: feeData } = await supabase
        .from('fees')
        .select('amount, paid_amount')
        .eq('school_id', targetSchoolId);

      const totalExpected = feeData?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
      const totalCollected = feeData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
      const feeCollectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
      const outstandingFees = totalExpected - totalCollected;

      // Calculate monthly growth (simplified - comparing current month to previous)
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const { data: currentMonthData } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('school_id', targetSchoolId)
        .eq('transaction_type', 'payment')
        .gte('created_at', new Date(currentYear, currentMonth, 1).toISOString())
        .lt('created_at', new Date(currentYear, currentMonth + 1, 1).toISOString());

      const { data: previousMonthData } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('school_id', targetSchoolId)
        .eq('transaction_type', 'payment')
        .gte('created_at', new Date(previousYear, previousMonth, 1).toISOString())
        .lt('created_at', new Date(previousYear, previousMonth + 1, 1).toISOString());

      const currentMonthRevenue = currentMonthData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const previousMonthRevenue = previousMonthData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      
      const monthlyGrowth = previousMonthRevenue > 0 
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : 0;

      setMetrics({
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalClasses: classesRes.count || 0,
        feeCollectionRate: Math.round(feeCollectionRate),
        totalRevenue: Math.round(totalRevenue),
        attendanceRate: Math.round(attendanceRate),
        outstandingFees: Math.round(outstandingFees),
        monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      });

      setError(null);
    } catch (err: any) {
      console.error("📊 SchoolOwnerMetricsFetcher: Error fetching metrics:", err);
      setError("Failed to load school metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolMetrics();
  }, [schoolId, user?.school_id]);

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <SchoolOwnerDashboardLayout
        metrics={metrics}
        loading={loading}
        schoolId={schoolId}
      />
      
      {/* Financial Overview - Linked to Finance Officer Dashboard */}
      <FinancialOverviewReadOnly />
      
      {/* Beautiful Report Generation */}
      <BeautifulReportGeneration userRole="school_owner" />
    </div>
  );
};

export default SchoolOwnerMetricsFetcher;
