import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle,
  XCircle,
  Edit,
  Send,
  Eye,
  Filter,
  RefreshCw,
  Loader2,
  AlertTriangle,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  FileText,
  AlertCircle,
  Download,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { DynamicGradingSheet } from "@/components/grading/DynamicGradingSheet";
import { StableGradingSheet } from "@/components/grading/StableGradingSheet";
import { useClasses } from "@/hooks/useClasses";
import { useSubjects } from "@/hooks/useSubjects";
import { useClassCurriculum } from "@/hooks/useClassCurriculum";
import { GradeManagementService } from "@/services/gradeManagementService";
import { useAcademicModuleIntegration } from "@/hooks/useAcademicModuleIntegration";
import { useCurrentAcademicInfo } from "@/hooks/useCurrentAcademicInfo";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GradeRecord {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "released";
  submitted_at: string;
  approved_by?: string;
  approved_at?: string;
  rejected_reason?: string;
  overridden_by?: string;
  overridden_at?: string;
  principal_notes?: string;
  released_by?: string;
  released_at?: string;
  term: string;
  exam_type: string;
  curriculum_type: string;
  students?: { name: string; admission_number: string };
  subjects?: { name: string; code: string };
  classes?: { name: string };
  profiles?: { name: string };
}

interface GradeAction {
  type: "approve" | "reject" | "override" | "release";
  gradeIds: string[];
  reason?: string;
  overrideScore?: number;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "submitted":
      return <Badge variant="secondary">Pending Review</Badge>;
    case "approved":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Approved
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "released":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          Released
        </Badge>
      );
    default:
      return <Badge variant="outline">Draft</Badge>;
  }
}

const PrincipalGradesModule: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { classes, loading: classesLoading } = useClasses();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { academicInfo, loading: academicInfoLoading } =
    useCurrentAcademicInfo(schoolId);

  // State management
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [selectedExamType, setSelectedExamType] = useState<string>("all");
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [totalGrades, setTotalGrades] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50); // Fixed page size for performance

  // Modal states
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [gradingSheetModalOpen, setGradingSheetModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<GradeAction | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [overrideScore, setOverrideScore] = useState("");
  const [processing, setProcessing] = useState(false);

  // Academic context
  const {
    context,
    isLoading: academicLoading,
    error: academicError,
    data: academicData,
    isValid,
    refreshData,
    currentPeriod,
    validation,
  } = useAcademicModuleIntegration(["grades"]);

  // Get curriculum type for selected class
  const {
    curriculumType: classCurriculumType,
    loading: classCurriculumLoading,
    error: curriculumError,
  } = useClassCurriculum(selectedClass !== "all" ? selectedClass : null);

  // Available academic terms and years
  const [availableTerms, setAvailableTerms] = useState<string[]>([]);
  const [availableExamTypes, setAvailableExamTypes] = useState<string[]>([]);

  // Load available terms and exam types
  useEffect(() => {
    const loadAvailableData = async () => {
      if (!schoolId) return;

      try {
        // Load academic terms
        const { data: termsData } = await supabase
          .from("academic_terms")
          .select("term_name")
          .eq("school_id", schoolId)
          .order("start_date");

        if (termsData) {
          const terms = termsData.map((t) => t.term_name).filter(Boolean);
          setAvailableTerms(terms);
        }

        // Load exam types from existing grades
        const { data: examTypesData } = await supabase
          .from("grades")
          .select("exam_type")
          .eq("school_id", schoolId)
          .not("exam_type", "is", null);

        if (examTypesData) {
          const examTypes = [...new Set(examTypesData.map((g) => g.exam_type))];
          setAvailableExamTypes(examTypes);
        }
      } catch (error) {
        console.error("Error loading available data:", error);
      }
    };

    loadAvailableData();
  }, [schoolId]);

  // Fetch grades when filters change
  useEffect(() => {
    if (schoolId) {
      fetchGrades();
    }
  }, [
    schoolId,
    selectedClass,
    selectedSubject,
    selectedStatus,
    selectedTerm,
    selectedExamType,
    currentPage,
  ]);

  const fetchGrades = async () => {
    if (!schoolId) return;

    setLoading(true);
    try {
      const filters = {
        classId: selectedClass !== "all" ? selectedClass : undefined,
        subjectId: selectedSubject !== "all" ? selectedSubject : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        term: selectedTerm !== "all" ? selectedTerm : undefined,
        examType: selectedExamType !== "all" ? selectedExamType : undefined,
      };

      const pagination = {
        page: currentPage,
        pageSize,
      };

      const result = await GradeManagementService.getGradesForPrincipal(
        schoolId,
        filters,
        pagination
      );

      if (result.error) {
        throw new Error(result.error);
      }

      setGrades(result.data || []);
      setTotalGrades(result.total || 0);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast({
        title: "Error",
        description: "Failed to fetch grades. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGrade = (gradeId: string) => {
    setSelectedGrades((prev) =>
      prev.includes(gradeId)
        ? prev.filter((id) => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGrades(grades.map((g) => g.id));
    } else {
      setSelectedGrades([]);
    }
    setSelectAll(checked);
  };

  const handleBulkAction = (
    action: "approve" | "reject" | "override" | "release"
  ) => {
    if (selectedGrades.length === 0) {
      toast({
        title: "No Grades Selected",
        description: "Please select at least one grade to perform this action.",
        variant: "destructive",
      });
      return;
    }

    setCurrentAction({
      type: action,
      gradeIds: selectedGrades,
    });
    setActionModalOpen(true);
  };

  const executeAction = async () => {
    if (!currentAction) return;

    setProcessing(true);
    try {
      const { type, gradeIds, reason, overrideScore } = currentAction;

      switch (type) {
        case "approve":
          await GradeManagementService.approveGrades(gradeIds, user?.id || "");
          break;
        case "reject":
          if (!reason?.trim()) {
            toast({
              title: "Reason Required",
              description: "Please provide a reason for rejection.",
              variant: "destructive",
            });
            return;
          }
          await GradeManagementService.rejectGrades(
            gradeIds,
            reason,
            user?.id || ""
          );
          break;
        case "override":
          if (!overrideScore || isNaN(Number(overrideScore))) {
            toast({
              title: "Invalid Score",
              description: "Please provide a valid override score.",
              variant: "destructive",
            });
            return;
          }
          await GradeManagementService.overrideGrades(
            gradeIds,
            Number(overrideScore),
            reason || "",
            user?.id || ""
          );
          break;
        case "release":
          await GradeManagementService.releaseGrades(gradeIds, user?.id || "");
          break;
      }

      toast({
        title: "Success",
        description: `Grades ${type}d successfully.`,
      });

      // Reset state
      setSelectedGrades([]);
      setSelectAll(false);
      setActionModalOpen(false);
      setCurrentAction(null);
      setActionReason("");
      setOverrideScore("");

      // Refresh grades
      fetchGrades();
    } catch (error) {
      console.error("Error executing action:", error);
      toast({
        title: "Error",
        description: `Failed to ${currentAction.type} grades. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const openGradingSheet = () => {
    if (!selectedClass || selectedClass === "all") {
      toast({
        title: "Class Required",
        description:
          "Please select a specific class to view the grading sheet.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTerm || selectedTerm === "all") {
      toast({
        title: "Term Required",
        description: "Please select a specific term to view the grading sheet.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedExamType || selectedExamType === "all") {
      toast({
        title: "Exam Type Required",
        description:
          "Please select a specific exam type to view the grading sheet.",
        variant: "destructive",
      });
      return;
    }

    setGradingSheetModalOpen(true);
  };

  const getFilteredGrades = (status: string) => {
    return grades.filter((grade) => {
      const statusMatch = status === "all" || grade.status === status;
      const classMatch =
        selectedClass === "all" || grade.class_id === selectedClass;
      const subjectMatch =
        selectedSubject === "all" || grade.subject_id === selectedSubject;
      const termMatch = selectedTerm === "all" || grade.term === selectedTerm;
      const examMatch =
        selectedExamType === "all" || grade.exam_type === selectedExamType;
      return (
        statusMatch && classMatch && subjectMatch && termMatch && examMatch
      );
    });
  };

  const pendingGrades = getFilteredGrades("submitted");
  const approvedGrades = getFilteredGrades("approved");
  const rejectedGrades = getFilteredGrades("rejected");
  const releasedGrades = getFilteredGrades("released");

  // Available classes for filtering
  const availableClasses = classes.filter((cls) => cls.school_id === schoolId);

  // Show curriculum warning if class has no curriculum type
  const showCurriculumWarning =
    selectedClass !== "all" &&
    classCurriculumType === "standard" &&
    !classCurriculumLoading &&
    !curriculumError;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Grades Management
          </h2>
          <p className="text-gray-600">
            Review, approve, and manage student grades across all classes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchGrades} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={openGradingSheet}
            disabled={
              !selectedClass ||
              selectedClass === "all" ||
              !selectedTerm ||
              selectedTerm === "all" ||
              !selectedExamType ||
              selectedExamType === "all"
            }
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            View Grading Sheet
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Curriculum Warning */}
          {showCurriculumWarning && (
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Curriculum type not assigned to this class. Please update class
                settings.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Subject
              </label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {availableTerms.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Exam Type
              </label>
              <Select
                value={selectedExamType}
                onValueChange={setSelectedExamType}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Exam Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exam Types</SelectItem>
                  {availableExamTypes.map((examType) => (
                    <SelectItem key={examType} value={examType}>
                      {examType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedGrades.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedGrades.length} grade(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedGrades([]);
                    setSelectAll(false);
                  }}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkAction("approve")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("reject")}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("override")}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Override
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkAction("release")}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Release
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grades Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending Review ({pendingGrades.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedGrades.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedGrades.length})
          </TabsTrigger>
          <TabsTrigger value="released" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Released ({releasedGrades.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <GradesTable
            grades={pendingGrades}
            selectedGrades={selectedGrades}
            onSelectGrade={handleSelectGrade}
            onSelectAll={handleSelectAll}
            selectAll={selectAll}
            loading={loading}
            onAction={handleBulkAction}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <GradesTable
            grades={approvedGrades}
            selectedGrades={selectedGrades}
            onSelectGrade={handleSelectGrade}
            onSelectAll={handleSelectAll}
            selectAll={selectAll}
            loading={loading}
            onAction={handleBulkAction}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <GradesTable
            grades={rejectedGrades}
            selectedGrades={selectedGrades}
            onSelectGrade={handleSelectGrade}
            onSelectAll={handleSelectAll}
            selectAll={selectAll}
            loading={loading}
            onAction={handleBulkAction}
            showActions={false}
          />
        </TabsContent>

        <TabsContent value="released" className="space-y-4">
          <GradesTable
            grades={releasedGrades}
            selectedGrades={selectedGrades}
            onSelectGrade={handleSelectGrade}
            onSelectAll={handleSelectAll}
            selectAll={selectAll}
            loading={loading}
            onAction={handleBulkAction}
            showActions={false}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination Controls */}
      {totalGrades > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalGrades)} of {totalGrades}{" "}
            grades
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {Math.ceil(totalGrades / pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(Math.ceil(totalGrades / pageSize), prev + 1)
                )
              }
              disabled={
                currentPage >= Math.ceil(totalGrades / pageSize) || loading
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAction?.type === "approve" && "Approve Grades"}
              {currentAction?.type === "reject" && "Reject Grades"}
              {currentAction?.type === "override" && "Override Grades"}
              {currentAction?.type === "release" && "Release Grades"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to {currentAction?.type}{" "}
              {currentAction?.gradeIds.length} grade(s)?
            </p>

            {(currentAction?.type === "reject" ||
              currentAction?.type === "override") && (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Enter reason for ${currentAction?.type}...`}
                />
              </div>
            )}

            {currentAction?.type === "override" && (
              <div className="space-y-2">
                <Label htmlFor="overrideScore">Override Score</Label>
                <Input
                  id="overrideScore"
                  type="number"
                  min="0"
                  max="100"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  placeholder="Enter new score (0-100)"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionModalOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button onClick={executeAction} disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {currentAction?.type === "approve" && "Approve"}
              {currentAction?.type === "reject" && "Reject"}
              {currentAction?.type === "override" && "Override"}
              {currentAction?.type === "release" && "Release"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Grading Sheet Modal */}
      <Dialog
        open={gradingSheetModalOpen}
        onOpenChange={setGradingSheetModalOpen}
      >
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Enhanced Grading Sheet</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh]">
            {selectedClass && selectedTerm && selectedExamType && (
              <StableGradingSheet
                classId={selectedClass}
                term={selectedTerm}
                examType={selectedExamType}
                onSubmissionSuccess={() => {
                  setGradingSheetModalOpen(false);
                  fetchGrades();
                  toast({
                    title: "Grades Updated",
                    description: "Grade sheet has been updated successfully.",
                  });
                }}
                isReadOnly={false}
                isPrincipal={true}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Grades Table Component
interface GradesTableProps {
  grades: GradeRecord[];
  selectedGrades: string[];
  onSelectGrade: (gradeId: string) => void;
  onSelectAll: (checked: boolean) => void;
  selectAll: boolean;
  loading: boolean;
  onAction: (action: "approve" | "reject" | "override" | "release") => void;
  showActions: boolean;
}

const GradesTable: React.FC<GradesTableProps> = ({
  grades,
  selectedGrades,
  onSelectGrade,
  onSelectAll,
  selectAll,
  loading,
  onAction,
  showActions,
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading grades...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (grades.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No grades found for the selected filters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={onSelectAll}
                    disabled={grades.length === 0}
                  />
                </TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Exam Type</TableHead>
                <TableHead>Submitted</TableHead>
                {showActions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedGrades.includes(grade.id)}
                      onCheckedChange={() => onSelectGrade(grade.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {grade.students?.name || "Unknown Student"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {grade.students?.admission_number || "No ID"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {grade.subjects?.name || "Unknown Subject"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {grade.subjects?.code || ""}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {grade.classes?.name || "Unknown Class"}
                  </TableCell>
                  <TableCell>
                    {grade.score}/{grade.max_score}
                  </TableCell>
                  <TableCell>{grade.percentage?.toFixed(1)}%</TableCell>
                  <TableCell>{grade.letter_grade}</TableCell>
                  <TableCell>{getStatusBadge(grade.status)}</TableCell>
                  <TableCell>{grade.term}</TableCell>
                  <TableCell>{grade.exam_type}</TableCell>
                  <TableCell>
                    {new Date(grade.submitted_at).toLocaleDateString()}
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAction("approve")}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAction("reject")}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAction("override")}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAction("release")}
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrincipalGradesModule;
