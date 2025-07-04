import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";
import { DynamicGradingSheet } from "./DynamicGradingSheet";
import { PrincipalGradeApprovalInterface } from "./PrincipalGradeApprovalInterface";
import { usePrincipalGradeManagement } from "@/hooks/usePrincipalGradeManagement";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Eye,
  AlertTriangle,
  Send,
  Save,
  RefreshCw,
  TestTube,
  GraduationCap,
  UserCheck,
  Shield,
} from "lucide-react";

interface GradingWorkflowTestProps {
  classId?: string;
  term?: string;
  examType?: string;
}

export const GradingWorkflowTest: React.FC<GradingWorkflowTestProps> = ({
  classId = "",
  term = "Term 1",
  examType = "MID_TERM",
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("teacher");
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Principal grade management hook
  const {
    grades: principalGrades,
    isLoading: principalLoading,
    processing: principalProcessing,
    handleApproveGrades,
    handleRejectGrades,
    handleReleaseGrades,
    refetch: refetchPrincipalGrades,
  } = usePrincipalGradeManagement();

  const [selectedTestClass, setSelectedTestClass] = useState(classId);
  const [selectedTestTerm, setSelectedTestTerm] = useState(term);
  const [selectedTestExamType, setSelectedTestExamType] = useState(examType);

  // Test state
  const [testGrades, setTestGrades] = useState<
    Record<string, Record<string, any>>
  >({});
  const [testSubmissionStatus, setTestSubmissionStatus] =
    useState<string>("not_started");

  const isTeacher = user?.role === "teacher";
  const isPrincipal = user?.role === "principal";

  // Load test data
  useEffect(() => {
    if (schoolId && selectedTestClass) {
      loadTestData();
    }
  }, [schoolId, selectedTestClass, selectedTestTerm, selectedTestExamType]);

  const loadTestData = async () => {
    try {
      // Load students
      const { data: students } = await supabase
        .from("students")
        .select("id, name")
        .eq("school_id", schoolId)
        .eq("class_id", selectedTestClass)
        .eq("is_active", true)
        .limit(3); // Limit for testing

      // Load subjects
      const { data: subjects } = await supabase
        .from("class_subjects")
        .select(
          `
          subjects (
            id,
            name
          )
        `
        )
        .eq("class_id", selectedTestClass)
        .eq("is_active", true)
        .limit(2); // Limit for testing

      if (students && subjects) {
        const subjectsList = subjects
          .map((cs: any) => cs.subjects)
          .filter(Boolean);

        // Initialize test grades
        const initialGrades: Record<string, Record<string, any>> = {};
        students.forEach((student: any) => {
          initialGrades[student.id] = {};
          subjectsList.forEach((subject: any) => {
            initialGrades[student.id][subject.id] = {
              score: Math.floor(Math.random() * 100) + 1, // Random score 1-100
              percentage: null,
              letter_grade: null,
              teacher_remarks: `Test grade for ${student.name} in ${subject.name}`,
            };
          });
        });

        setTestGrades(initialGrades);
      }
    } catch (error) {
      console.error("Error loading test data:", error);
    }
  };

  const runWorkflowTest = async () => {
    setIsRunningTest(true);
    const results: Record<string, any> = {};

    try {
      // Test 1: Teacher Grade Submission
      results.teacherSubmission = await testTeacherSubmission();

      // Test 2: Principal Grade Approval
      results.principalApproval = await testPrincipalApproval();

      // Test 3: Grade Release
      results.gradeRelease = await testGradeRelease();

      setTestResults(results);

      toast({
        title: "Workflow Test Complete",
        description: "All tests have been completed. Check the results below.",
      });
    } catch (error: any) {
      console.error("Workflow test failed:", error);
      toast({
        title: "Test Failed",
        description: error.message || "Workflow test failed",
        variant: "destructive",
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  const testTeacherSubmission = async () => {
    const result = {
      success: false,
      message: "",
      submittedGrades: 0,
    };

    try {
      if (!user?.id || !schoolId) {
        throw new Error("User or school information missing");
      }

      // Submit test grades
      const gradesToSubmit = [];
      for (const [studentId, studentGrades] of Object.entries(testGrades)) {
        for (const [subjectId, gradeValue] of Object.entries(studentGrades)) {
          gradesToSubmit.push({
            school_id: schoolId,
            student_id: studentId,
            subject_id: subjectId,
            class_id: selectedTestClass,
            term: selectedTestTerm,
            exam_type: selectedTestExamType,
            score: gradeValue.score,
            max_score: 100,
            percentage: (gradeValue.score / 100) * 100,
            letter_grade: gradeValue.letter_grade,
            curriculum_type: "standard",
            status: "submitted",
            submitted_by: user.id,
            submitted_at: new Date().toISOString(),
            comments: gradeValue.teacher_remarks,
          });
        }
      }

      const { error } = await supabase.from("grades").upsert(gradesToSubmit, {
        onConflict:
          "school_id,student_id,subject_id,class_id,term,exam_type,submitted_by",
        ignoreDuplicates: false,
      });

      if (error) throw error;

      result.success = true;
      result.message = "Teacher grade submission successful";
      result.submittedGrades = gradesToSubmit.length;
      setTestSubmissionStatus("submitted");
    } catch (error: any) {
      result.message = `Teacher submission failed: ${error.message}`;
    }

    return result;
  };

  const testPrincipalApproval = async () => {
    const result = {
      success: false,
      message: "",
      approvedGrades: 0,
    };

    try {
      if (!isPrincipal) {
        throw new Error("User is not a principal");
      }

      // Get submitted grades for approval
      const { data: submittedGrades } = await supabase
        .from("grades")
        .select("id")
        .eq("school_id", schoolId)
        .eq("class_id", selectedTestClass)
        .eq("term", selectedTestTerm)
        .eq("exam_type", selectedTestExamType)
        .eq("status", "submitted");

      if (!submittedGrades || submittedGrades.length === 0) {
        throw new Error("No submitted grades found for approval");
      }

      const gradeIds = submittedGrades.map((g) => g.id);
      await handleApproveGrades(gradeIds);

      result.success = true;
      result.message = "Principal grade approval successful";
      result.approvedGrades = gradeIds.length;
    } catch (error: any) {
      result.message = `Principal approval failed: ${error.message}`;
    }

    return result;
  };

  const testGradeRelease = async () => {
    const result = {
      success: false,
      message: "",
      releasedGrades: 0,
    };

    try {
      if (!isPrincipal) {
        throw new Error("User is not a principal");
      }

      // Get approved grades for release
      const { data: approvedGrades } = await supabase
        .from("grades")
        .select("id")
        .eq("school_id", schoolId)
        .eq("class_id", selectedTestClass)
        .eq("term", selectedTestTerm)
        .eq("exam_type", selectedTestExamType)
        .eq("status", "approved");

      if (!approvedGrades || approvedGrades.length === 0) {
        throw new Error("No approved grades found for release");
      }

      const gradeIds = approvedGrades.map((g) => g.id);
      await handleReleaseGrades(gradeIds);

      result.success = true;
      result.message = "Grade release successful";
      result.releasedGrades = gradeIds.length;
    } catch (error: any) {
      result.message = `Grade release failed: ${error.message}`;
    }

    return result;
  };

  const resetTestData = async () => {
    try {
      // Delete test grades
      await supabase
        .from("grades")
        .delete()
        .eq("school_id", schoolId)
        .eq("class_id", selectedTestClass)
        .eq("term", selectedTestTerm)
        .eq("exam_type", selectedTestExamType)
        .eq("submitted_by", user?.id);

      setTestGrades({});
      setTestResults({});
      setTestSubmissionStatus("not_started");

      toast({
        title: "Test Data Reset",
        description: "All test data has been cleared.",
      });
    } catch (error: any) {
      console.error("Error resetting test data:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset test data",
        variant: "destructive",
      });
    }
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TestTube className="h-6 w-6 text-blue-600" />
            Grading Workflow Test Suite
            <Badge variant="outline" className="ml-auto">
              {isTeacher
                ? "Teacher Mode"
                : isPrincipal
                ? "Principal Mode"
                : "Admin Mode"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Purpose:</strong> Test the complete grading workflow from
              teacher submission to principal approval and release.
            </p>
            <p>
              <strong>Current User:</strong> {user?.name} ({user?.role})
            </p>
            <p>
              <strong>School:</strong> {schoolId}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Test Class</label>
              <input
                type="text"
                value={selectedTestClass}
                onChange={(e) => setSelectedTestClass(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                placeholder="Enter class ID"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Test Term</label>
              <select
                value={selectedTestTerm}
                onChange={(e) => setSelectedTestTerm(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Test Exam Type</label>
              <select
                value={selectedTestExamType}
                onChange={(e) => setSelectedTestExamType(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              >
                <option value="OPENER">Opener</option>
                <option value="MID_TERM">Mid Term</option>
                <option value="END_TERM">End Term</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={runWorkflowTest}
              disabled={isRunningTest || !selectedTestClass}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunningTest ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Running Tests...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Run Complete Workflow Test
                </>
              )}
            </Button>
            <Button
              onClick={resetTestData}
              variant="outline"
              disabled={isRunningTest}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Test Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(testResults).map(([testName, result]) => (
                <div
                  key={testName}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div className="flex items-center gap-3">
                    {getTestStatusIcon(result.success ? "success" : "error")}
                    <div>
                      <h4 className="font-medium capitalize">
                        {testName.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  <Badge
                    className={getTestStatusColor(
                      result.success ? "success" : "error"
                    )}
                  >
                    {result.success ? "PASSED" : "FAILED"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="teacher" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Teacher Interface
          </TabsTrigger>
          <TabsTrigger value="principal" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Principal Interface
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Workflow Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teacher">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Teacher Grade Submission Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTestClass ? (
                <DynamicGradingSheet
                  classId={selectedTestClass}
                  term={selectedTestTerm}
                  examType={selectedTestExamType}
                  onSubmissionSuccess={() => {
                    setTestSubmissionStatus("submitted");
                    toast({
                      title: "Test Submission Success",
                      description: "Grades submitted successfully for testing",
                    });
                  }}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please enter a test class ID to start the teacher interface
                    test.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="principal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Principal Grade Approval Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPrincipal ? (
                <PrincipalGradeApprovalInterface
                  grades={principalGrades}
                  onBulkAction={async (gradeIds, action) => {
                    try {
                      switch (action) {
                        case "approve":
                          await handleApproveGrades(gradeIds);
                          break;
                        case "reject":
                          await handleRejectGrades(gradeIds);
                          break;
                        case "release":
                          await handleReleaseGrades(gradeIds);
                          break;
                      }
                    } catch (error: any) {
                      toast({
                        title: "Action Failed",
                        description: error.message,
                        variant: "destructive",
                      });
                    }
                  }}
                  processing={principalProcessing}
                  schoolId={schoolId || ""}
                  allowRelease={true}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    This interface is only available to principals. Current user
                    role: {user?.role}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Workflow Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">Draft</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {
                        principalGrades.filter((g) => g.status === "draft")
                          .length
                      }
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Submitted</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {
                        principalGrades.filter((g) => g.status === "submitted")
                          .length
                      }
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Approved</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {
                        principalGrades.filter((g) => g.status === "approved")
                          .length
                      }
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Released</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {
                        principalGrades.filter((g) => g.status === "released")
                          .length
                      }
                    </p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Test Submission Status</h4>
                  <Badge
                    className={getTestStatusColor(
                      testSubmissionStatus === "submitted"
                        ? "success"
                        : "pending"
                    )}
                  >
                    {testSubmissionStatus === "submitted"
                      ? "SUBMITTED"
                      : "NOT SUBMITTED"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
