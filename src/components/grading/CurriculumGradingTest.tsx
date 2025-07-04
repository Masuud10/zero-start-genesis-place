import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DynamicGradingSheet } from "./DynamicGradingSheet";
import { validateClassCurriculumSetup } from "@/utils/curriculum-validator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  GraduationCap,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Loader2,
  TestTube,
} from "lucide-react";

interface CurriculumGradingTestProps {
  onClose?: () => void;
}

interface TestClass {
  id: string;
  name: string;
  curriculum_type?: string;
  curriculum?: string;
}

export const CurriculumGradingTest: React.FC<CurriculumGradingTestProps> = ({
  onClose,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedExamType, setSelectedExamType] = useState<string>("");
  const [showGradingSheet, setShowGradingSheet] = useState(false);
  const [testClasses, setTestClasses] = useState<TestClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    class?: { name?: string };
    curriculumType?: string;
    error?: string;
    suggestions?: string[];
  } | null>(null);
  const { toast } = useToast();

  // Load test classes from database
  useEffect(() => {
    loadTestClasses();
  }, []);

  const loadTestClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, curriculum_type, curriculum")
        .limit(10);

      if (error) throw error;
      setTestClasses(data || []);
    } catch (error) {
      console.error("Error loading test classes:", error);
      toast({
        title: "Error",
        description: "Failed to load test classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelection = async (classId: string) => {
    setSelectedClass(classId);
    setValidationResult(null);

    if (classId) {
      try {
        const result = await validateClassCurriculumSetup(classId, supabase);
        setValidationResult(result);

        if (!result.isValid) {
          toast({
            title: "Curriculum Issue",
            description: result.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Curriculum Valid",
            description: `Class uses ${result.curriculumType.toUpperCase()} curriculum`,
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error validating class curriculum:", error);
      }
    }
  };

  const handleTestGradingSheet = () => {
    if (selectedClass && selectedTerm && selectedExamType) {
      setShowGradingSheet(true);
    }
  };

  const handleSubmissionSuccess = () => {
    console.log("🎓 Test: Grades submitted successfully!");
    toast({
      title: "Test Success",
      description: "Grades submitted successfully for testing",
      variant: "default",
    });
    setShowGradingSheet(false);
  };

  const getCurriculumBadge = (curriculumType?: string, curriculum?: string) => {
    const type = curriculumType || curriculum;
    if (!type)
      return (
        <Badge variant="outline" className="text-red-600">
          No Type
        </Badge>
      );

    switch (type.toLowerCase()) {
      case "cbc":
        return <Badge className="bg-blue-100 text-blue-800">CBC</Badge>;
      case "igcse":
        return <Badge className="bg-purple-100 text-purple-800">IGCSE</Badge>;
      case "standard":
        return <Badge className="bg-green-100 text-green-800">Standard</Badge>;
      default:
        return (
          <Badge variant="outline" className="text-orange-600">
            {type}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Curriculum-Based Grading Sheet Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            Test the dynamic grading sheet functionality with different
            curriculum types. This test validates curriculum detection, grading
            sheet generation, and data persistence.
          </div>

          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Class</label>
              <Select
                value={selectedClass}
                onValueChange={handleClassSelection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class to test" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading classes...
                      </div>
                    </SelectItem>
                  ) : (
                    testClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        <div className="flex items-center gap-2">
                          <span>{cls.name}</span>
                          {getCurriculumBadge(
                            cls.curriculum_type,
                            cls.curriculum
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exam Type</label>
              <Select
                value={selectedExamType}
                onValueChange={setSelectedExamType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mid Term">Mid Term</SelectItem>
                  <SelectItem value="End Term">End Term</SelectItem>
                  <SelectItem value="Continuous Assessment">
                    Continuous Assessment
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="mb-6">
              {validationResult.isValid ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">
                    Curriculum Valid
                  </AlertTitle>
                  <AlertDescription className="text-green-700">
                    <div className="space-y-1">
                      <p>
                        <strong>Class:</strong> {validationResult.class?.name}
                      </p>
                      <p>
                        <strong>Curriculum Type:</strong>{" "}
                        {validationResult.curriculumType.toUpperCase()}
                      </p>
                      <p>
                        <strong>Status:</strong> Ready for grading
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">
                    Curriculum Issue
                  </AlertTitle>
                  <AlertDescription className="text-red-700">
                    <div className="space-y-2">
                      <p>{validationResult.error}</p>
                      {validationResult.suggestions && (
                        <div className="mt-2">
                          <p className="font-medium">Suggestions:</p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {validationResult.suggestions.map(
                              (suggestion: string, index: number) => (
                                <li key={index}>{suggestion}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Test Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleTestGradingSheet}
              disabled={
                !selectedClass ||
                !selectedTerm ||
                !selectedExamType ||
                (validationResult && !validationResult.isValid)
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Test Dynamic Grading Sheet
            </Button>
            <Button
              onClick={loadTestClasses}
              disabled={loading}
              variant="outline"
            >
              <Loader2
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh Classes
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close Test
              </Button>
            )}
          </div>

          {/* Test Summary */}
          {selectedClass && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">
                  Test Configuration
                </span>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  <strong>Class:</strong>{" "}
                  {testClasses.find((c) => c.id === selectedClass)?.name}
                </p>
                <p>
                  <strong>Curriculum:</strong>{" "}
                  {validationResult?.curriculumType?.toUpperCase() || "Unknown"}
                </p>
                <p>
                  <strong>Term:</strong> {selectedTerm}
                </p>
                <p>
                  <strong>Exam Type:</strong> {selectedExamType}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {validationResult?.isValid
                    ? "Ready for Testing"
                    : "Needs Configuration"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Grading Sheet */}
      {showGradingSheet &&
        selectedClass &&
        selectedTerm &&
        selectedExamType && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Dynamic Grading Sheet - Test Mode</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGradingSheet(false)}
                >
                  Close Sheet
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicGradingSheet
                classId={selectedClass}
                term={selectedTerm}
                examType={selectedExamType}
                onSubmissionSuccess={handleSubmissionSuccess}
                isReadOnly={false}
              />
            </CardContent>
          </Card>
        )}
    </div>
  );
};
