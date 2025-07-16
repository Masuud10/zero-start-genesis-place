import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { DebugTestSuite, DebugTestSuiteResults } from "@/utils/debugTestSuite";

const DebugTestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DebugTestSuiteResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const testResults = await DebugTestSuite.runAllTests();
      setResults(testResults);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getOverallStatus = () => {
    if (!results) return null;

    const { passed, failed, total } = results.overall;
    const successRate = (passed / total) * 100;

    if (failed === 0) {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All tests passed! ({successRate.toFixed(1)}% success rate)
          </AlertDescription>
        </Alert>
      );
    } else if (successRate >= 80) {
      return (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Most tests passed ({successRate.toFixed(1)}% success rate). Some
            issues need attention.
          </AlertDescription>
        </Alert>
      );
    } else {
      return (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Multiple tests failed ({successRate.toFixed(1)}% success rate).
            Critical issues detected.
          </AlertDescription>
        </Alert>
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Debug Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing of all debugging fixes for authentication,
            database, routing, and API issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runTests} disabled={isRunning} className="w-full">
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Running Tests...
              </>
            ) : (
              "Run Debug Tests"
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Test execution failed: {error}
          </AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="space-y-6">
          {/* Overall Status */}
          {getOverallStatus()}

          {/* Overall Results */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Overall Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {results.overall.total}
                  </div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {results.overall.passed}
                  </div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {results.overall.failed}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authentication Tests */}
          <Card>
            <CardHeader>
              <CardTitle>🔐 Authentication Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.authentication.map((test, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.passed)}
                      <span className="text-sm">{test.testName}</span>
                    </div>
                    {test.details && (
                      <span className="text-xs text-gray-500">
                        {JSON.stringify(test.details)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Database Tests */}
          <Card>
            <CardHeader>
              <CardTitle>🗄️ Database Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.database.map((test, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.passed)}
                      <span className="text-sm">{test.testName}</span>
                    </div>
                    {test.details && (
                      <span className="text-xs text-gray-500">
                        {JSON.stringify(test.details)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Routing Tests */}
          <Card>
            <CardHeader>
              <CardTitle>🧭 Routing Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.routing.map((test, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.passed)}
                      <span className="text-sm">{test.testName}</span>
                    </div>
                    {test.details && (
                      <span className="text-xs text-gray-500">
                        {JSON.stringify(test.details)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Tests */}
          <Card>
            <CardHeader>
              <CardTitle>🔌 API Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.api.map((test, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.passed)}
                      <span className="text-sm">{test.testName}</span>
                    </div>
                    {test.details && (
                      <span className="text-xs text-gray-500">
                        {JSON.stringify(test.details)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {results.overall.failed === 0 ? (
                <div className="space-y-2 text-green-800">
                  <p>
                    🎉 All tests passed! The debugging fixes are working
                    correctly.
                  </p>
                  <p>✅ HR users should now be able to login successfully.</p>
                  <p>✅ No more "Database error querying schema" errors.</p>
                  <p>✅ Role-based routing is working properly.</p>
                </div>
              ) : (
                <div className="space-y-2 text-yellow-800">
                  <p>⚠️ Some tests failed. Please review the errors above.</p>
                  <p>
                    🔧 Consider applying the database migrations manually via
                    Supabase Dashboard.
                  </p>
                  <p>📧 Contact support if issues persist.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DebugTestRunner;
