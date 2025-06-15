import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { startOfYear, subMonths, startOfMonth } from "date-fns";
import SchoolOwnerDashboardLayout from "./SchoolOwnerDashboardLayout";
import SchoolOwnerErrorState from "./SchoolOwnerErrorState";
import SchoolOwnerLoadingSkeleton from "./SchoolOwnerLoadingSkeleton";
import { SchoolMetrics } from "./SchoolOwnerStatsCards";

const initialMetrics: SchoolMetrics = {
  totalStudents: 0,
  totalTeachers: 0,
  totalRevenue: 0,
  outstandingFees: 0,
  monthlyGrowth: 0,
};

const SchoolOwnerMetricsFetcher: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { schoolId, validateSchoolAccess } = useSchoolScopedData();
  const [metrics, setMetrics] = useState<SchoolMetrics>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!schoolId) throw new Error("No school ID available");
      if (!user) throw new Error("User not logged in");

      if (!validateSchoolAccess(schoolId)) {
        throw new Error("Access denied to school data");
      }

      const studentsCountPromise = supabase
        .from("students")
        .select("id", { count: "exact" })
        .eq("school_id", schoolId)
        .eq("is_active", true);

      const teachersCountPromise = supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .eq("school_id", schoolId)
        .eq("role", "teacher");

      const ytdRevenuePromise = supabase
        .from("fees")
        .select("paid_amount")
        .eq("school_id", schoolId)
        .eq("status", "paid")
        .gte("paid_date", startOfYear(new Date()).toISOString());

      const outstandingFeesPromise = supabase.rpc("get_outstanding_fees", {
        p_school_id: schoolId,
      });

      const now = new Date();
      const startOfThisMonth = startOfMonth(now);
      const startOfLastMonth = startOfMonth(subMonths(now, 1));

      const newStudentsThisMonthPromise = supabase
        .from("students")
        .select("id", { count: "exact" })
        .eq("school_id", schoolId)
        .gte("created_at", startOfThisMonth.toISOString());

      const newStudentsLastMonthPromise = supabase
        .from("students")
        .select("id", { count: "exact" })
        .eq("school_id", schoolId)
        .gte("created_at", startOfLastMonth.toISOString())
        .lt("created_at", startOfThisMonth.toISOString());

      const [
        { count: studentsCount, error: studentsError },
        { count: teachersCount, error: teachersError },
        { data: revenueData, error: revenueError },
        { data: outstandingFees, error: outstandingError },
        { count: newStudentsThisMonth, error: newStudentsThisMonthError },
        { count: newStudentsLastMonth, error: newStudentsLastMonthError },
      ] = await Promise.all([
        studentsCountPromise,
        teachersCountPromise,
        ytdRevenuePromise,
        outstandingFeesPromise,
        newStudentsThisMonthPromise,
        newStudentsLastMonthPromise,
      ]);

      if (
        studentsError ||
        teachersError ||
        revenueError ||
        outstandingError ||
        newStudentsThisMonthError ||
        newStudentsLastMonthError
      ) {
        throw new Error("Failed to fetch some data");
      }

      const totalRevenue = (revenueData || []).reduce(
        (sum, fee) => sum + (fee.paid_amount || 0),
        0
      );

      const lastMonthCount = newStudentsLastMonth || 0;
      const thisMonthCount = newStudentsThisMonth || 0;
      let monthlyGrowth = 0;
      if (lastMonthCount > 0) {
        monthlyGrowth = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
      } else if (thisMonthCount > 0) {
        monthlyGrowth = thisMonthCount * 100;
      }

      setMetrics({
        totalStudents: studentsCount || 0,
        totalTeachers: teachersCount || 0,
        totalRevenue,
        outstandingFees: outstandingFees || 0,
        monthlyGrowth,
      });
    } catch (error: any) {
      setError(error.message || "Failed to fetch school metrics");
      toast({
        title: "Error",
        description: `Failed to fetch school metrics: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [schoolId, user, toast, validateSchoolAccess]);

  useEffect(() => {
    if (schoolId && user) {
      fetchSchoolMetrics();
    } else if (!user) {
      setLoading(false);
      setError("User is not authenticated");
    } else {
      setLoading(false);
      setError("No school assignment found");
    }
  }, [schoolId, user, fetchSchoolMetrics]);

  const handleManagementAction = (action: string) => {
    // Placeholder for future modal/page navigation
    // eslint-disable-next-line no-console
    console.log("Clicked School Management Action:", action);
  };

  if (error && !loading) {
    return <SchoolOwnerErrorState error={error} onRetry={fetchSchoolMetrics} />;
  }

  if (loading) {
    return <SchoolOwnerLoadingSkeleton />;
  }

  return (
    <SchoolOwnerDashboardLayout
      metrics={metrics}
      loading={loading}
      schoolId={schoolId}
      onManagementAction={handleManagementAction}
    />
  );
};

export default SchoolOwnerMetricsFetcher;
