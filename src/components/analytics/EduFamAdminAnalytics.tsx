
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEduFamAnalytics } from "@/hooks/useEduFamAnalytics";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, TrendingUp, TrendingDown, Users, GraduationCap, CalendarCheck, DollarSign, BarChart3, AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface School {
  id: string;
  name: string;
}

const EduFamAdminAnalytics = () => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("this_month");
  const { user } = useAuth();
  const { toast } = useToast();

  // Load schools list for dropdown
  useEffect(() => {
    const loadSchools = async () => {
      if (user?.role === "edufam_admin") {
        setSchoolsLoading(true);
        setSchoolsError(null);
        
        try {
          console.log('🏫 EduFamAnalytics: Loading schools list...');
          
          const { data, error } = await supabase
            .from("schools")
            .select("id, name")
            .order("name");
          
          if (error) {
            console.error('🚫 EduFamAnalytics: Schools loading error:', {
              error,
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            throw error;
          }
          
          console.log('✅ EduFamAnalytics: Schools loaded successfully:', data);
          setSchools(data || []);
          setSchoolsError(null);
        } catch (error: any) {
          console.error('🚫 EduFamAnalytics: Failed to load schools:', error);
          const errorMessage = error?.message || "Failed to load schools list";
          setSchoolsError(errorMessage);
          toast({
            title: "Error Loading Schools",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setSchoolsLoading(false);
        }
      }
    };
    loadSchools();
  }, [user?.role, toast]);

  // Date range calculation
  const now = new Date();
  let startDate: string | undefined;
  let endDate: string | undefined;
  
  if (dateFilter === "this_month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
  } else if (dateFilter === "last_month") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
  }

  // Fetch analytics data
  const { summary, loading, error, retry } = useEduFamAnalytics({
    schoolId: selectedSchoolId || undefined,
    startDate,
    endDate,
  });

  // School options for dropdown
  const schoolOptions = [
    { id: "", name: "All Schools" },
    ...schools
  ];

  // Helper for formatting numbers
  const formatNumber = (value: number | null | undefined, decimals = 1) => {
    if (typeof value === "number" && !isNaN(value)) {
      return value.toFixed(decimals);
    }
    return "N/A";
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (typeof value === "number" && !isNaN(value)) {
      return `KES ${value.toLocaleString()}`;
    }
    return "KES 0";
  };

  // Permission check
  if (user?.role !== "edufam_admin") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert className="bg-red-50 border-red-200 max-w-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Access Denied</AlertTitle>
          <AlertDescription className="text-red-700">
            Only EduFam Admins can access schools analytics.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (loading || schoolsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">
          {schoolsLoading ? "Loading schools..." : "Loading analytics data..."}
        </p>
      </div>
    );
  }

  // Schools loading error
  if (schoolsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert className="bg-red-50 border-red-200 max-w-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Failed to Load Schools</AlertTitle>
          <AlertDescription className="text-red-700 mb-4">
            {schoolsError}
          </AlertDescription>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </Alert>
      </div>
    );
  }

  // Analytics error state
  if (error) {
    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schools Analytics</h1>
            <p className="text-gray-600 mt-1">System-wide analytics dashboard</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">School:</label>
            <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {schoolOptions.map(school => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error Display */}
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Analytics Error</AlertTitle>
          <AlertDescription className="text-red-700 mb-4">
            {error}
          </AlertDescription>
          <div className="flex gap-2">
            <button
              onClick={retry}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <button
              onClick={() => {
                console.log('🔧 Manual debug info:', {
                  user,
                  selectedSchoolId,
                  dateFilter,
                  schoolsCount: schools.length
                });
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded transition-colors"
            >
              Debug Info
            </button>
          </div>
        </Alert>
      </div>
    );
  }

  const gradesSummary = summary?.grades ?? { totalGrades: 0, averageGrade: null };
  const attendanceSummary = summary?.attendance ?? { totalRecords: 0, attendanceRate: null };
  const financeSummary = summary?.finance ?? { totalCollected: null, transactionsCount: 0 };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schools Analytics</h1>
          <p className="text-gray-600 mt-1">
            {selectedSchoolId ? `Analytics for ${schools.find(s => s.id === selectedSchoolId)?.name}` : "System-wide analytics"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">School:</label>
          <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a school" />
            </SelectTrigger>
            <SelectContent>
              {schoolOptions.map(school => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Grades Analytics Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Academic Performance
            </CardTitle>
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {gradesSummary.totalGrades}
                </div>
                <p className="text-xs text-gray-600">Total Grades Recorded</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold text-green-600">
                  {formatNumber(gradesSummary.averageGrade)}%
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  Average Grade
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Analytics Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Attendance Tracking
            </CardTitle>
            <CalendarCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {attendanceSummary.totalRecords}
                </div>
                <p className="text-xs text-gray-600">Attendance Records</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold text-green-600">
                  {formatNumber(attendanceSummary.attendanceRate)}%
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  Attendance Rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finance Analytics Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Financial Overview
            </CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(financeSummary.totalCollected)}
                </div>
                <p className="text-xs text-gray-600">Total Revenue</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold text-blue-600">
                  {financeSummary.transactionsCount}
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <Users className="h-3 w-3 text-blue-500 mr-1" />
                  Transactions
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No Data State */}
      {!loading && summary && (
        gradesSummary.totalGrades === 0 && 
        attendanceSummary.totalRecords === 0 && 
        financeSummary.transactionsCount === 0
      ) && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 mb-4">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Analytics Data Available</h3>
              <p className="text-sm">
                {selectedSchoolId 
                  ? "This school has no recorded data for the selected period." 
                  : "No system-wide data available for the selected period."
                }
              </p>
            </div>
            <button
              onClick={retry}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded transition-colors"
            >
              Refresh Data
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EduFamAdminAnalytics;
