import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { DynamicGradingSheet } from "@/components/grading/DynamicGradingSheet";
import { useClasses } from "@/hooks/useClasses";
import { useSubjects } from "@/hooks/useSubjects";
import { useClassCurriculum } from "@/hooks/useClassCurriculum";
import { GradeManagementService } from "@/services/gradeManagementService";
import { useAcademicModuleIntegration } from "@/hooks/useAcademicModuleIntegration";

interface GradeRecord {
  id: string;
  student_name: string;
  subject_name: string;
  class_name: string;
  teacher_name: string;
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
}

interface GradeAction {
  type: "approve" | "reject" | "override" | "release";
  gradeIds: string[];
  reason?: string;
  overrideScore?: number;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return <span className="text-green-600">Approved</span>;
    case "pending":
      return <span className="text-yellow-600">Pending</span>;
    case "rejected":
      return <span className="text-red-600">Rejected</span>;
    case "released":
      return <span className="text-blue-600">Released</span>;
    default:
      return <span className="text-gray-500">Unknown</span>;
  }
}

const PrincipalGradesModule: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { classes } = useClasses();
  const { subjects } = useSubjects();

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

  // Modal states
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [gradingSheetModalOpen, setGradingSheetModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<GradeAction | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [overrideScore, setOverrideScore] = useState("");
  const [processing, setProcessing] = useState(false);

  // Get curriculum type for selected class
  const {
    curriculumType: classCurriculumType,
    loading: classCurriculumLoading,
  } = useClassCurriculum(selectedClass);

  // Replace all direct context, class, subject, and student fetching with useAcademicModuleIntegration
  const {
    context,
    isLoading,
    error: academicError,
    data: academicData,
    isValid,
    refreshData,
    currentPeriod,
    validation,
  } = useAcademicModuleIntegration(["grades"]);

  // Load grades when filters change
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
  ]);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("grades")
        .select(
          `
          id,
          score,
          max_score,
          percentage,
          letter_grade,
          status,
          submitted_at,
          approved_by,
          approved_at,
          principal_notes,
          released_by,
          released_at,
          term,
          exam_type,
          curriculum_type,
          students!inner(name),
          subjects!inner(name),
          classes!inner(name),
          profiles!inner(name)
        `
        )
        .eq("school_id", schoolId);

      // Apply filters
      if (selectedClass && selectedClass !== "all")
        query = query.eq("class_id", selectedClass);
      if (selectedSubject && selectedSubject !== "all")
        query = query.eq("subject_id", selectedSubject);
      if (selectedStatus !== "all") query = query.eq("status", selectedStatus);
      if (selectedTerm && selectedTerm !== "all")
        query = query.eq("term", selectedTerm);
      if (selectedExamType && selectedExamType !== "all")
        query = query.eq("exam_type", selectedExamType);

      const { data, error } = await query.order("submitted_at", {
        ascending: false,
      });

      if (error) throw error;

      const processedGrades: GradeRecord[] = (data || []).map(
        (grade: {
          id: string;
          score: number | null;
          max_score: number | null;
          percentage: number | null;
          letter_grade: string | null;
          status: string | null;
          submitted_at: string;
          approved_by: string | null;
          approved_at: string | null;
          principal_notes: string | null;
          released_by: string | null;
          released_at: string | null;
          term: string;
          exam_type: string;
          curriculum_type: string;
          students: { name: string } | null;
          subjects: { name: string } | null;
          classes: { name: string } | null;
          profiles: { name: string } | null;
        }) => ({
          id: grade.id,
          student_name: grade.students?.name || "Unknown",
          subject_name: grade.subjects?.name || "Unknown",
          class_name: grade.classes?.name || "Unknown",
          teacher_name: grade.profiles?.name || "Unknown",
          score: grade.score || 0,
          max_score: grade.max_score || 100,
          percentage: grade.percentage || 0,
          letter_grade: grade.letter_grade || "",
          status:
            (grade.status as
              | "draft"
              | "submitted"
              | "approved"
              | "rejected"
              | "released") || "draft",
          submitted_at: grade.submitted_at,
          approved_by: grade.approved_by,
          approved_at: grade.approved_at,
          rejected_reason: "", // This column doesn't exist in the database yet
          overridden_by: "", // This column doesn't exist in the database yet
          overridden_at: "", // This column doesn't exist in the database yet
          principal_notes: grade.principal_notes,
          released_by: grade.released_by,
          released_at: grade.released_at,
          term: grade.term,
          exam_type: grade.exam_type,
          curriculum_type: grade.curriculum_type,
        })
      );

      setGrades(processedGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast({
        title: "Error",
        description: "Failed to load grades. Please try again.",
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
    setSelectAll(checked);
    setSelectedGrades(checked ? grades.map((g) => g.id) : []);
  };

  const handleBulkAction = (
    action: "approve" | "reject" | "override" | "release"
  ) => {
    if (selectedGrades.length === 0) {
      toast({
        title: "No Grades Selected",
        description: "Please select grades to perform this action.",
        variant: "default",
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
    if (!currentAction || !user?.id) return;

    setProcessing(true);
    try {
      const { type, gradeIds, reason } = currentAction;

      // Validate permission first
      const permissionCheck =
        await GradeManagementService.validateGradeActionPermission(
          user.id,
          schoolId,
          type
        );

      if (!permissionCheck.canPerform) {
        toast({
          title: "Permission Denied",
          description:
            permissionCheck.error ||
            "You don't have permission to perform this action.",
          variant: "destructive",
        });
        return;
      }

      let result;
      switch (type) {
        case "approve":
          result = await GradeManagementService.approveGrades(
            gradeIds,
            user.id,
            schoolId,
            reason
          );
          break;
        case "reject":
          result = await GradeManagementService.rejectGrades(
            gradeIds,
            user.id,
            schoolId,
            reason || ""
          );
          break;
        case "override":
          result = await GradeManagementService.overrideGrades(
            gradeIds,
            user.id,
            schoolId,
            parseFloat(overrideScore),
            reason || ""
          );
          break;
        case "release":
          result = await GradeManagementService.releaseGrades(
            gradeIds,
            user.id,
            schoolId
          );
          break;
      }

      if (result?.success) {
        toast({
          title: "Success",
          description: `Grades ${type}d successfully.`,
        });

        setActionModalOpen(false);
        setCurrentAction(null);
        setActionReason("");
        setOverrideScore("");
        setSelectedGrades([]);
        setSelectAll(false);
        fetchGrades();
      } else {
        toast({
          title: "Error",
          description:
            result?.error || `Failed to ${type} grades. Please try again.`,
          variant: "destructive",
        });
      }
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
    if (
      selectedClass === "all" ||
      selectedTerm === "all" ||
      selectedExamType === "all"
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please select specific class, term, and exam type to open grading sheet.",
        variant: "default",
      });
      return;
    }
    setGradingSheetModalOpen(true);
  };

  const getFilteredGrades = (status: string) => {
    return grades.filter(
      (grade) => status === "all" || grade.status === status
    );
  };

  const pendingGrades = getFilteredGrades("submitted");
  const approvedGrades = getFilteredGrades("approved");
  const rejectedGrades = getFilteredGrades("rejected");
  const releasedGrades = getFilteredGrades("released");

  const availableClasses = Array.isArray(academicData?.classes)
    ? academicData.classes
    : [];
  const availableSubjects = Array.isArray(academicData?.subjects)
    ? academicData.subjects
    : [];
  const students = Array.isArray(academicData?.students)
    ? academicData.students
    : [];

  const validGrades = Array.isArray(grades)
    ? grades.filter(
        (g) => g && typeof g === "object" && !("error" in g) && "id" in g
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Grade Management
              </CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Principal Access
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchGrades}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={openGradingSheet}
                disabled={!selectedClass || !selectedTerm || !selectedExamType}
              >
                <FileText className="h-4 w-4 mr-2" />
                Open Grading Sheet
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
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
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
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
                  <SelectValue placeholder="All Exams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  <SelectItem value="OPENER">Opener</SelectItem>
                  <SelectItem value="MID_TERM">Mid Term</SelectItem>
                  <SelectItem value="END_TERM">End Term</SelectItem>
                  <SelectItem value="CAT">CAT</SelectItem>
                  <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
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
      <Tabs defaultValue="submitted" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="submitted" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending ({pendingGrades.length})
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

        <TabsContent value="submitted" className="space-y-4">
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

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentAction?.type === "approve" && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {currentAction?.type === "reject" && (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {currentAction?.type === "override" && (
                <Edit className="h-5 w-5 text-orange-600" />
              )}
              {currentAction?.type === "release" && (
                <Send className="h-5 w-5 text-purple-600" />
              )}
              {currentAction?.type?.charAt(0).toUpperCase() +
                currentAction?.type?.slice(1)}{" "}
              Grades
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason/Comment</Label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={`Enter reason for ${currentAction?.type}ing grades...`}
                className="mt-1"
              />
            </div>
            {currentAction?.type === "override" && (
              <div>
                <Label>Override Score</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  placeholder="Enter new score (0-100)"
                  className="mt-1"
                />
              </div>
            )}
            <div className="text-sm text-gray-600">
              This action will affect {currentAction?.gradeIds.length} grade(s).
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionModalOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={executeAction}
              disabled={
                processing ||
                (currentAction?.type === "override" && !overrideScore)
              }
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `${
                  currentAction?.type?.charAt(0).toUpperCase() +
                  currentAction?.type?.slice(1)
                }`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grading Sheet Modal */}
      {gradingSheetModalOpen &&
        selectedClass &&
        selectedTerm &&
        selectedExamType && (
          <Dialog
            open={gradingSheetModalOpen}
            onOpenChange={setGradingSheetModalOpen}
          >
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Principal Grading Sheet</DialogTitle>
              </DialogHeader>
              <DynamicGradingSheet
                classId={selectedClass}
                term={selectedTerm}
                examType={selectedExamType}
                onSubmissionSuccess={() => {
                  setGradingSheetModalOpen(false);
                  fetchGrades();
                  toast({
                    title: "Success",
                    description: "Grades updated successfully.",
                  });
                }}
                isReadOnly={false}
              />
            </DialogContent>
          </Dialog>
        )}
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
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-2">
            <FileText className="h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">
              No grades found
            </h3>
            <p className="text-gray-500">
              No grades match the current filters.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox checked={selectAll} onCheckedChange={onSelectAll} />
              </TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
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
                <TableCell className="font-medium">
                  {grade.student_name}
                </TableCell>
                <TableCell>{grade.subject_name}</TableCell>
                <TableCell>{grade.class_name}</TableCell>
                <TableCell>{grade.teacher_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {grade.score}/{grade.max_score}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({grade.percentage}%)
                    </span>
                    {grade.letter_grade && (
                      <Badge variant="outline" className="text-xs">
                        {grade.letter_grade}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(grade.status)}</TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500">
                    {new Date(grade.submitted_at).toLocaleDateString()}
                  </div>
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAction("approve")}
                        className="h-8 px-2"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAction("reject")}
                        className="h-8 px-2"
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAction("override")}
                        className="h-8 px-2"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {grade.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAction("release")}
                          className="h-8 px-2"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PrincipalGradesModule;
