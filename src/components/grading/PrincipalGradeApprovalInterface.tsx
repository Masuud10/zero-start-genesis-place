import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Filter,
  AlertCircle,
} from "lucide-react";
import { usePrincipalGradeManagement } from "@/hooks/usePrincipalGradeManagement";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade: string;
  status: string;
  submitted_at: string;
  term: string;
  exam_type: string;
  students?: { id: string; name: string; admission_number: string };
  subjects?: { id: string; name: string; code: string };
  classes?: { id: string; name: string };
  profiles?: { id: string; name: string };
}

interface PrincipalGradeApprovalInterfaceProps {
  grades?: Grade[];
  onBulkAction?: (
    gradeIds: string[],
    action: "approve" | "reject" | "release"
  ) => Promise<void>;
  processing?: string | null;
  schoolId: string;
  allowRelease?: boolean;
  readOnly?: boolean;
  onGradeOverride?: (grade: Grade) => void;
}

export const PrincipalGradeApprovalInterface: React.FC<
  PrincipalGradeApprovalInterfaceProps
> = ({
  grades: propGrades,
  onBulkAction,
  processing,
  schoolId,
  allowRelease = false,
  readOnly = false,
  onGradeOverride,
}) => {
  const {
    grades: hookGrades,
    isLoading,
    processing: hookProcessing,
    handleApproveGrades,
    handleRejectGrades,
    handleReleaseGrades,
  } = usePrincipalGradeManagement();

  const { toast } = useToast();
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  // Use provided grades or hook grades
  const grades = propGrades || hookGrades || [];
  const currentProcessing = processing || hookProcessing;

  // Enhanced school context validation
  if (!schoolId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No school context available for grade management.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter grades with enhanced validation
  const filteredGrades = grades.filter((grade) => {
    if (!grade || !grade.id) return false;

    if (filterStatus !== "all" && grade.status !== filterStatus) return false;
    if (filterClass !== "all" && grade.class_id !== filterClass) return false;
    if (filterSubject !== "all" && grade.subject_id !== filterSubject)
      return false;
    return true;
  });

  const handleSelectGrade = (gradeId: string) => {
    if (readOnly) return;

    setSelectedGrades((prev) =>
      prev.includes(gradeId)
        ? prev.filter((id) => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  const handleSelectAll = () => {
    if (readOnly) return;

    if (selectedGrades.length === filteredGrades.length) {
      setSelectedGrades([]);
    } else {
      setSelectedGrades(filteredGrades.map((g) => g.id));
    }
  };

  const handleBulkActionInternal = async (
    action: "approve" | "reject" | "release"
  ) => {
    if (selectedGrades.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select grades to perform this action.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(
        `🔄 PrincipalGradeApprovalInterface: Performing ${action} on grades:`,
        selectedGrades
      );

      if (onBulkAction) {
        await onBulkAction(selectedGrades, action);
      } else {
        // Fallback to hook functions
        switch (action) {
          case "approve":
            await handleApproveGrades(selectedGrades);
            break;
          case "reject":
            await handleRejectGrades(selectedGrades);
            break;
          case "release":
            await handleReleaseGrades(selectedGrades);
            break;
        }
      }

      setSelectedGrades([]);
      console.log(
        `✅ PrincipalGradeApprovalInterface: ${action} completed successfully`
      );
    } catch (error: any) {
      console.error(
        `❌ PrincipalGradeApprovalInterface: ${action} failed:`,
        error
      );
      toast({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Failed`,
        description: error.message || `Failed to ${action} grades`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      submitted: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      released: "bg-blue-100 text-blue-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  // Get unique classes and subjects for filtering
  const uniqueClasses = Array.from(
    new Set(grades.map((g) => g.classes?.name).filter(Boolean))
  );
  const uniqueSubjects = Array.from(
    new Set(grades.map((g) => g.subjects?.name).filter(Boolean))
  );

  if (isLoading && !propGrades) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading grades...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map((subjectName) => (
                    <SelectItem key={subjectName} value={subjectName}>
                      {subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Bulk Actions */}
      {!readOnly && selectedGrades.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedGrades.length} grade
                {selectedGrades.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                {!allowRelease && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleBulkActionInternal("approve")}
                      disabled={currentProcessing === "approve"}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {currentProcessing === "approve"
                        ? "Approving..."
                        : "Approve Selected"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleBulkActionInternal("reject")}
                      disabled={currentProcessing === "reject"}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {currentProcessing === "reject"
                        ? "Rejecting..."
                        : "Reject Selected"}
                    </Button>
                  </>
                )}
                {allowRelease && (
                  <Button
                    size="sm"
                    onClick={() => handleBulkActionInternal("release")}
                    disabled={currentProcessing === "release"}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {currentProcessing === "release"
                      ? "Releasing..."
                      : "Release Selected"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Grades Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Grade Details ({filteredGrades.length})</CardTitle>
            {!readOnly && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                disabled={filteredGrades.length === 0}
              >
                {selectedGrades.length === filteredGrades.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredGrades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No grades found matching the current filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGrades.map((grade) => (
                <div
                  key={grade.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    selectedGrades.includes(grade.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {!readOnly && (
                        <input
                          type="checkbox"
                          checked={selectedGrades.includes(grade.id)}
                          onChange={() => handleSelectGrade(grade.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">
                          {grade.students?.name || "Unknown Student"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {grade.classes?.name || "Unknown Class"} -{" "}
                          {grade.subjects?.name || "Unknown Subject"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {grade.term} {grade.exam_type} • Score:{" "}
                          {grade.score || 0}/{grade.max_score || 100} (
                          {grade.percentage?.toFixed(1) || "0.0"}%) • Grade:{" "}
                          {grade.letter_grade || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadge(grade.status)}>
                        {grade.status}
                      </Badge>
                      {!readOnly && grade.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onGradeOverride?.(grade)}
                          className="h-6 px-2"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Override
                        </Button>
                      )}
                      <span className="text-sm text-gray-500">
                        {grade.submitted_at
                          ? new Date(grade.submitted_at).toLocaleDateString()
                          : "Unknown date"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
