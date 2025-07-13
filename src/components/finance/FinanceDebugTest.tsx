import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  DollarSign,
  CreditCard,
  Users,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOptimizedFinanceMetrics } from "@/hooks/finance/useOptimizedFinanceMetrics";
import { useFinanceOfficerAnalytics } from "@/hooks/useFinanceOfficerAnalytics";
import { useMpesaTransactions } from "@/hooks/useMpesaTransactions";
import { useStudentAccounts } from "@/hooks/useStudentAccounts";
import {
  useFinancialReports,
  ReportType,
} from "@/hooks/finance/useFinancialReports";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "loading";
  message: string;
  details?: unknown;
}

const FinanceDebugTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();

  // Hooks for testing
  const {
    metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useOptimizedFinanceMetrics();
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useFinanceOfficerAnalytics({ term: "current", class: "all" });
  const {
    transactions: mpesaTransactions,
    loading: mpesaLoading,
    error: mpesaError,
    refetch: refetchMpesa,
  } = useMpesaTransactions();
  const {
    studentAccounts,
    loading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useStudentAccounts();
  const {
    generateReport,
    isGenerating,
    error: reportsError,
  } = useFinancialReports();

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];

    // Test 1: User Authentication
    results.push({
      name: "User Authentication",
      status: user ? "pass" : "fail",
      message: user
        ? "User authenticated successfully"
        : "User not authenticated",
      details: user
        ? { email: user.email, role: user.role, schoolId: user.school_id }
        : null,
    });

    // Test 2: School ID Validation
    results.push({
      name: "School ID Validation",
      status: user?.school_id ? "pass" : "fail",
      message: user?.school_id
        ? "School ID is valid"
        : "School ID is missing or invalid",
      details: user?.school_id ? { schoolId: user.school_id } : null,
    });

    // Test 3: Database Connection
    try {
      const { data, error } = await supabase
        .from("fees")
        .select("count", { count: "exact", head: true });
      results.push({
        name: "Database Connection",
        status: error ? "fail" : "pass",
        message: error
          ? `Database connection failed: ${error.message}`
          : "Database connection successful",
        details: error
          ? { error: error.message }
          : { count: data?.length || 0 },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      results.push({
        name: "Database Connection",
        status: "fail",
        message: `Database connection error: ${errorMessage}`,
        details: { error: errorMessage },
      });
    }

    // Test 4: Finance Metrics Hook
    results.push({
      name: "Finance Metrics Hook",
      status: metricsLoading ? "loading" : metricsError ? "fail" : "pass",
      message: metricsLoading
        ? "Loading finance metrics..."
        : metricsError
        ? `Metrics error: ${metricsError.message}`
        : "Finance metrics loaded successfully",
      details: metrics
        ? {
            totalRevenue: metrics.totalRevenue,
            totalCollected: metrics.totalCollected,
            outstandingAmount: metrics.outstandingAmount,
            collectionRate: metrics.collectionRate,
          }
        : null,
    });

    // Test 5: Analytics Hook
    results.push({
      name: "Finance Analytics Hook",
      status: analyticsLoading ? "loading" : analyticsError ? "fail" : "pass",
      message: analyticsLoading
        ? "Loading analytics..."
        : analyticsError
        ? `Analytics error: ${analyticsError.message}`
        : "Analytics loaded successfully",
      details: analyticsData
        ? {
            keyMetrics: analyticsData.keyMetrics,
            feeCollectionData: analyticsData.feeCollectionData.length,
            defaultersList: analyticsData.defaultersList.length,
          }
        : null,
    });

    // Test 6: MPESA Transactions Hook
    results.push({
      name: "MPESA Transactions Hook",
      status: mpesaLoading ? "loading" : mpesaError ? "fail" : "pass",
      message: mpesaLoading
        ? "Loading MPESA transactions..."
        : mpesaError
        ? `MPESA error: ${mpesaError}`
        : "MPESA transactions loaded successfully",
      details: mpesaTransactions
        ? {
            totalTransactions: mpesaTransactions.length,
            successfulTransactions: mpesaTransactions.filter(
              (t) => t.transaction_status === "Success"
            ).length,
          }
        : null,
    });

    // Test 7: Student Accounts Hook
    results.push({
      name: "Student Accounts Hook",
      status: accountsLoading ? "loading" : accountsError ? "fail" : "pass",
      message: accountsLoading
        ? "Loading student accounts..."
        : accountsError
        ? `Accounts error: ${accountsError}`
        : "Student accounts loaded successfully",
      details: studentAccounts
        ? {
            totalAccounts: studentAccounts.length,
            accountsWithBalance: studentAccounts.filter(
              (acc) => acc.outstanding > 0
            ).length,
          }
        : null,
    });

    // Test 8: Financial Reports Hook
    results.push({
      name: "Financial Reports Hook",
      status: reportsError ? "fail" : "pass",
      message: reportsError
        ? `Reports error: ${reportsError}`
        : "Financial reports hook ready",
      details: { isGenerating },
    });

    // Test 9: Report Generation Test
    try {
      const testReport = await generateReport("financial_summary", {
        dateRange: "current_term",
        classId: undefined,
      });
      results.push({
        name: "Report Generation Test",
        status: testReport ? "pass" : "fail",
        message: testReport
          ? "Report generated successfully"
          : "Report generation failed",
        details: testReport
          ? {
              title: testReport.title,
              records: testReport.data.length,
              summary: testReport.summary,
            }
          : null,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      results.push({
        name: "Report Generation Test",
        status: "fail",
        message: `Report generation error: ${errorMessage}`,
        details: { error: errorMessage },
      });
    }

    // Test 10: Database Tables Check
    try {
      const tables = [
        "fees",
        "students",
        "classes",
        "mpesa_transactions",
        "expenses",
      ];
      const tableResults = await Promise.allSettled(
        tables.map((table) => {
          // Use type assertion for dynamic table access
          const client = supabase as unknown as {
            from: (table: string) => {
              select: (
                columns: string,
                options?: { count: string; head: boolean }
              ) => Promise<{ data: unknown; error: unknown; count?: number }>;
            };
          };
          return client
            .from(table)
            .select("count", { count: "exact", head: true });
        })
      );

      const tableStatus = tableResults.map((result, index) => ({
        table: tables[index],
        status:
          result.status === "fulfilled" && !result.value.error
            ? "pass"
            : "fail",
        count: result.status === "fulfilled" ? result.value.count || 0 : 0,
      }));

      results.push({
        name: "Database Tables Check",
        status: tableStatus.every((t) => t.status === "pass") ? "pass" : "fail",
        message: tableStatus.every((t) => t.status === "pass")
          ? "All required tables accessible"
          : "Some tables inaccessible",
        details: { tables: tableStatus },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      results.push({
        name: "Database Tables Check",
        status: "fail",
        message: `Database tables check error: ${errorMessage}`,
        details: { error: errorMessage },
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "loading":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-50 border-green-200";
      case "fail":
        return "bg-red-50 border-red-200";
      case "loading":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-yellow-50 border-yellow-200";
    }
  };

  const passedTests = testResults.filter((r) => r.status === "pass").length;
  const failedTests = testResults.filter((r) => r.status === "fail").length;
  const loadingTests = testResults.filter((r) => r.status === "loading").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCw className="h-6 w-6" />
            Finance Dashboard Debug Test
          </h2>
          <p className="text-muted-foreground">
            Comprehensive testing of all finance officer dashboard features
          </p>
        </div>
        <Button onClick={runAllTests} disabled={isRunning}>
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      {/* Test Summary */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Passed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {passedTests}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {failedTests}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Loading</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loadingTests}
                  </p>
                </div>
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Total</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {testResults.length}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results */}
      <div className="space-y-4">
        {testResults.map((result, index) => (
          <Card key={index} className={getStatusColor(result.status)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <CardTitle className="text-lg">{result.name}</CardTitle>
                </div>
                <Badge
                  variant={
                    result.status === "pass"
                      ? "default"
                      : result.status === "fail"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {result.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{result.message}</p>
              {result.details && (
                <div className="bg-white/50 rounded p-3 text-xs">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={refetchMetrics}
              disabled={metricsLoading}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Refresh Metrics
            </Button>
            <Button
              variant="outline"
              onClick={refetchMpesa}
              disabled={mpesaLoading}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Refresh MPESA
            </Button>
            <Button
              variant="outline"
              onClick={refetchAccounts}
              disabled={accountsLoading}
            >
              <Users className="h-4 w-4 mr-2" />
              Refresh Accounts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {failedTests > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Issues Found:</strong> {failedTests} test(s) failed. Please
            check the database connection, user permissions, and ensure all
            required tables exist. Contact system administrator if issues
            persist.
          </AlertDescription>
        </Alert>
      )}

      {passedTests === testResults.length && testResults.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>All Tests Passed!</strong> The finance officer dashboard is
            working correctly. All features should be functional and responsive.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FinanceDebugTest;
