import React, { useState } from "react";
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
import { DynamicGradingSheet } from "./DynamicGradingSheet";
import { BookOpen, GraduationCap, Calculator } from "lucide-react";

interface DynamicGradingSheetTestProps {
  onClose?: () => void;
}

export const DynamicGradingSheetTest: React.FC<
  DynamicGradingSheetTestProps
> = ({ onClose }) => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedExamType, setSelectedExamType] = useState<string>("");
  const [showGradingSheet, setShowGradingSheet] = useState(false);

  // Mock class data for testing
  const testClasses = [
    { id: "class-cbc-1", name: "Grade 1 CBC", curriculum: "cbc" },
    { id: "class-igcse-1", name: "Year 10 IGCSE", curriculum: "igcse" },
    {
      id: "class-standard-1",
      name: "Grade 8 Standard",
      curriculum: "standard",
    },
  ];

  const handleTestGradingSheet = () => {
    if (selectedClass && selectedTerm && selectedExamType) {
      setShowGradingSheet(true);
    }
  };

  const handleSubmissionSuccess = () => {
    console.log("🎓 Test: Grades submitted successfully!");
    setShowGradingSheet(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dynamic Grading Sheet Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            Test the dynamic grading sheet with different curriculum types.
            Select a class, term, and exam type to see the appropriate grading
            format.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a test class" />
                </SelectTrigger>
                <SelectContent>
                  {testClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      <div className="flex items-center gap-2">
                        <span>{cls.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {cls.curriculum.toUpperCase()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
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

          <div className="flex gap-4">
            <Button
              onClick={handleTestGradingSheet}
              disabled={!selectedClass || !selectedTerm || !selectedExamType}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Test Dynamic Grading Sheet
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close Test
              </Button>
            )}
          </div>

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
                  {testClasses
                    .find((c) => c.id === selectedClass)
                    ?.curriculum.toUpperCase()}
                </p>
                <p>
                  <strong>Term:</strong> {selectedTerm}
                </p>
                <p>
                  <strong>Exam Type:</strong> {selectedExamType}
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
