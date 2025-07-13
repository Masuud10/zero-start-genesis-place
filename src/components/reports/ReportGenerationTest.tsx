import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  EnhancedReportService,
  EnhancedReportData,
  ExportOptions,
} from "@/services/enhancedReportService";
import {
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const ReportGenerationTest: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResults, setTestResults] = useState<
    Array<{
      test: string;
      status: "success" | "error" | "pending";
      message: string;
    }>
  >([]);
  const { toast } = useToast();

  const runTest = async (
    testName: string,
    testFunction: () => Promise<void>
  ) => {
    setTestResults((prev) => [
      ...prev,
      { test: testName, status: "pending", message: "Running..." },
    ]);

    try {
      await testFunction();
      setTestResults((prev) =>
        prev.map((result) =>
          result.test === testName
            ? { ...result, status: "success", message: "Passed" }
            : result
        )
      );
    } catch (error) {
      setTestResults((prev) =>
        prev.map((result) =>
          result.test === testName
            ? {
                ...result,
                status: "error",
                message: error instanceof Error ? error.message : "Failed",
              }
            : result
        )
      );
    }
  };

  const testDataValidation = async () => {
    // Test with valid data
    const validData: EnhancedReportData = {
      id: "test-1",
      title: "Test Report",
      generatedAt: new Date().toISOString(),
      schoolInfo: {
        name: "Test School",
        address: "Test Address",
        phone: "123-456-7890",
        email: "test@school.com",
      },
      content: {
        schools: [
          { id: "1", name: "School 1", status: "active" },
          { id: "2", name: "School 2", status: "active" },
        ],
        users: [
          { id: "1", name: "User 1", role: "teacher" },
          { id: "2", name: "User 2", role: "student" },
        ],
      },
      generatedBy: "Test User",
      role: "admin",
      summary: {
        totalRecords: 4,
        totalStudents: 1,
        totalTeachers: 1,
      },
    };

    // This should not throw an error
    await EnhancedReportService.generatePDF(validData, { format: 'pdf' });
  };

  const testPDFGeneration = async () => {
    const testData: EnhancedReportData = {
      id: "test-pdf",
      title: "PDF Test Report",
      generatedAt: new Date().toISOString(),
      schoolInfo: {
        name: "Test School",
        address: "Test Address",
      },
      content: {
        schools: [
          {
            id: "1",
            name: "School 1",
            status: "active",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            name: "School 2",
            status: "active",
            created_at: new Date().toISOString(),
          },
        ],
        users: [
          {
            id: "1",
            name: "User 1",
            role: "teacher",
            email: "user1@test.com",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            name: "User 2",
            role: "student",
            email: "user2@test.com",
            created_at: new Date().toISOString(),
          },
        ],
        grades: [
          {
            id: "1",
            students: { name: "Student 1" },
            subjects: { name: "Math" },
            grade: "A",
            percentage: 85,
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            students: { name: "Student 2" },
            subjects: { name: "English" },
            grade: "B",
            percentage: 78,
            created_at: new Date().toISOString(),
          },
        ],
        attendance: [
          {
            id: "1",
            students: { name: "Student 1" },
            classes: { name: "Class 1" },
            status: "present",
            date: new Date().toISOString(),
          },
          {
            id: "2",
            students: { name: "Student 2" },
            classes: { name: "Class 1" },
            status: "absent",
            date: new Date().toISOString(),
          },
        ],
        transactions: [
          {
            id: "1",
            students: { name: "Student 1" },
            amount: 1000,
            payment_method: "cash",
            status: "success",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            students: { name: "Student 2" },
            amount: 1500,
            payment_method: "mpesa",
            status: "success",
            created_at: new Date().toISOString(),
          },
        ],
      },
      generatedBy: "Test User",
      role: "admin",
      summary: {
        totalRecords: 10,
        totalStudents: 2,
        totalTeachers: 1,
        averageGrade: 81.5,
        attendanceRate: 50,
        totalAmount: 2500,
      },
    };

    await EnhancedReportService.generatePDF(testData, { format: 'pdf' });
  };

  const testExcelGeneration = async () => {
    const testData: EnhancedReportData = {
      id: "test-excel",
      title: "Excel Test Report",
      generatedAt: new Date().toISOString(),
      schoolInfo: {
        name: "Test School",
        address: "Test Address",
      },
      content: {
        schools: [
          {
            id: "1",
            name: "School 1",
            status: "active",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            name: "School 2",
            status: "active",
            created_at: new Date().toISOString(),
          },
        ],
        users: [
          {
            id: "1",
            name: "User 1",
            role: "teacher",
            email: "user1@test.com",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            name: "User 2",
            role: "student",
            email: "user2@test.com",
            created_at: new Date().toISOString(),
          },
        ],
      },
      generatedBy: "Test User",
      role: "admin",
      summary: {
        totalRecords: 4,
        totalStudents: 1,
        totalTeachers: 1,
      },
    };

    await EnhancedReportService.generateExcel(testData, { format: 'excel' });
  };

  const testExportService = async () => {
    const testData: EnhancedReportData = {
      id: "test-export",
      title: "Export Test Report",
      generatedAt: new Date().toISOString(),
      schoolInfo: {
        name: "Test School",
        address: "Test Address",
      },
      content: {
        schools: [
          {
            id: "1",
            name: "School 1",
            status: "active",
            created_at: new Date().toISOString(),
          },
        ],
      },
      generatedBy: "Test User",
      role: "admin",
      summary: {
        totalRecords: 1,
      },
    };

    const options: ExportOptions = {
      format: "pdf",
      includeLogo: true,
      includeTimestamp: true,
      includeFooter: true,
      includeCharts: false,
    };

    await EnhancedReportService.exportReport(testData, options);
  };

  const runAllTests = async () => {
    setIsGenerating(true);
    setTestResults([]);

    try {
      await runTest("Data Validation", testDataValidation);
      await runTest("PDF Generation", testPDFGeneration);
      await runTest("Excel Generation", testExcelGeneration);
      await runTest("Export Service", testExportService);

      const successCount = testResults.filter(
        (r) => r.status === "success"
      ).length;
      const errorCount = testResults.filter((r) => r.status === "error").length;

      if (errorCount === 0) {
        toast({
          title: "✅ All Tests Passed",
          description: `${successCount} tests completed successfully`,
        });
      } else {
        toast({
          title: "❌ Some Tests Failed",
          description: `${errorCount} tests failed, ${successCount} passed`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Test Suite Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Enhanced Report Generation Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This test suite verifies that the enhanced report generation system
            is working correctly and can generate reports without blank content
            issues.
          </p>

          <Button
            onClick={runAllTests}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Run All Tests
              </>
            )}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Test Results:</h4>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 border rounded"
                >
                  {result.status === "success" && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {result.status === "error" && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  {result.status === "pending" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span className="text-sm font-medium">{result.test}</span>
                  <Badge
                    variant={
                      result.status === "success"
                        ? "default"
                        : result.status === "error"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {result.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {result.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerationTest;
