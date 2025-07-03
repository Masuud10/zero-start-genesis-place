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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { usePrincipalGradeManagement } from "@/hooks/usePrincipalGradeManagement";
import { useClasses } from "@/hooks/useClasses";
import { useSubjects } from "@/hooks/useSubjects";
import { PrincipalGradeApprovalInterface } from "@/components/grading/PrincipalGradeApprovalInterface";
import {
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Edit,
  Send,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";

const PrincipalGradesModule: React.FC = () => {
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const {
    grades,
    isLoading,
    processing,
    handleApproveGrades,
    handleRejectGrades,
    handleReleaseGrades,
    refetch,
  } = usePrincipalGradeManagement();

  const { classes } = useClasses();
  const { subjects } = useSubjects();

  const [activeTab, setActiveTab] = useState("pending");

  // Grade override modal state
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [overrideScore, setOverrideScore] = useState<string>("");
  const [overrideNotes, setOverrideNotes] = useState<string>("");

  const getFilteredGrades = (status: string) => {
    return grades.filter((grade) => {
      const statusMatch = status === "all" || grade.status === status;
      return statusMatch;
    });
  };

  const pendingGrades = getFilteredGrades("submitted");
  const approvedGrades = getFilteredGrades("approved");
  const rejectedGrades = getFilteredGrades("rejected");
  const releasedGrades = getFilteredGrades("released");

  const uniqueTerms = Array.from(
    new Set(grades.map((g) => g.term).filter(Boolean))
  );

  const handleBulkAction = async (
    gradeIds: string[],
    action: "approve" | "reject" | "release"
  ) => {
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
        description: error.message || "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  };

  const handleGradeOverride = (grade: any) => {
    setSelectedGrade(grade);
    setOverrideScore(grade.score?.toString() || "");
    setOverrideNotes(grade.principal_notes || "");
    setOverrideModalOpen(true);
  };

  const handleOverrideSubmit = async () => {
    if (!selectedGrade || !overrideScore) {
      toast({
        title: "Invalid Input",
        description: "Please provide a valid score",
        variant: "destructive",
      });
      return;
    }

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { useAuth } = await import("@/contexts/AuthContext");
      const { user } = useAuth();

      const { error } = await supabase
        .from("grades")
        .update({
          score: parseFloat(overrideScore),
          percentage:
            (parseFloat(overrideScore) / selectedGrade.max_score) * 100,
          principal_notes: overrideNotes,
          overridden_by: user?.id,
          overridden_at: new Date().toISOString(),
        })
        .eq("id", selectedGrade.id);

      if (error) throw error;

      toast({
        title: "Grade Overridden",
        description: "Grade has been successfully overridden",
      });

      setOverrideModalOpen(false);
      setSelectedGrade(null);
      setOverrideScore("");
      setOverrideNotes("");
      refetch();
    } catch (error: any) {
      toast({
        title: "Override Failed",
        description: error.message || "Failed to override grade",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Principal Grade Management</h1>
          <p className="text-muted-foreground">
            Approve, review, override, and release student grades
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {pendingGrades.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approved
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {approvedGrades.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Released
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {releasedGrades.length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rejected
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {rejectedGrades.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Review ({pendingGrades.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedGrades.length})
          </TabsTrigger>
          <TabsTrigger value="released" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Released ({releasedGrades.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Rejected ({rejectedGrades.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PrincipalGradeApprovalInterface
            grades={pendingGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId}
            allowRelease={false}
            onGradeOverride={handleGradeOverride}
          />
        </TabsContent>

        <TabsContent value="approved">
          <PrincipalGradeApprovalInterface
            grades={approvedGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId}
            allowRelease={true}
            onGradeOverride={handleGradeOverride}
          />
        </TabsContent>

        <TabsContent value="released">
          <PrincipalGradeApprovalInterface
            grades={releasedGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId}
            readOnly={true}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <PrincipalGradeApprovalInterface
            grades={rejectedGrades}
            onBulkAction={handleBulkAction}
            processing={processing}
            schoolId={schoolId}
            readOnly={true}
          />
        </TabsContent>
      </Tabs>

      {/* Grade Override Modal */}
      <Dialog open={overrideModalOpen} onOpenChange={setOverrideModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Grade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedGrade && (
              <div className="space-y-2">
                <p>
                  <strong>Student:</strong> {selectedGrade.students?.name}
                </p>
                <p>
                  <strong>Subject:</strong> {selectedGrade.subjects?.name}
                </p>
                <p>
                  <strong>Class:</strong> {selectedGrade.classes?.name}
                </p>
                <p>
                  <strong>Current Score:</strong> {selectedGrade.score}/
                  {selectedGrade.max_score}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="override-score">New Score</Label>
              <Input
                id="override-score"
                type="number"
                min="0"
                max={selectedGrade?.max_score || 100}
                value={overrideScore}
                onChange={(e) => setOverrideScore(e.target.value)}
                placeholder="Enter new score"
              />
            </div>
            <div>
              <Label htmlFor="override-notes">Notes (Optional)</Label>
              <Textarea
                id="override-notes"
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="Reason for override..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOverrideModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleOverrideSubmit}>Override Grade</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrincipalGradesModule;
