import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePrincipalGradeManagement } from "@/hooks/usePrincipalGradeManagement";
import { PrincipalGradeApprovalInterface } from "@/components/grading/PrincipalGradeApprovalInterface";
import TeacherGradesManager from "@/components/dashboard/teacher/TeacherGradesManager";
import {
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  GraduationCap,
  Edit,
  Send,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PrincipalGradesSectionProps {
  schoolId: string;
  onModalOpen?: (modalType: string) => void;
}

const PrincipalGradesSection: React.FC<PrincipalGradesSectionProps> = ({
  schoolId,
  onModalOpen,
}) => {
  const navigate = useNavigate();
  const {
    grades,
    isLoading,
    processing,
    handleApproveGrades,
    handleRejectGrades,
    handleReleaseGrades,
  } = usePrincipalGradeManagement();
  const [activeTab, setActiveTab] = useState("overview");

  const pendingGrades = grades.filter((g) => g.status === "submitted");
  const approvedGrades = grades.filter((g) => g.status === "approved");
  const releasedGrades = grades.filter((g) => g.status === "released");
  const rejectedGrades = grades.filter((g) => g.status === "rejected");

  const handleViewGrades = () => {
    navigate("/grades");
  };

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
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  };

  return (
    <section className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingGrades.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedGrades.length})
          </TabsTrigger>
          <TabsTrigger value="tools">Grading Tools</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Approval
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {pendingGrades.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Grades awaiting review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Approved Grades
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {approvedGrades.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ready for release
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Released Grades
                </CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {releasedGrades.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Visible to parents
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Rejected Grades
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {rejectedGrades.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Need revision
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleBulkAction(pendingGrades.map(g => g.id), "approve")}
                  disabled={pendingGrades.length === 0 || processing === "approve"}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All Pending ({pendingGrades.length})
                </Button>
                <Button
                  onClick={() => handleBulkAction(approvedGrades.map(g => g.id), "release")}
                  disabled={approvedGrades.length === 0 || processing === "release"}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Release All Approved ({approvedGrades.length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Grades Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Grade Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PrincipalGradeApprovalInterface
                grades={pendingGrades}
                onBulkAction={handleBulkAction}
                processing={processing}
                schoolId={schoolId}
                allowRelease={false}
                readOnly={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Grades Tab */}
        <TabsContent value="approved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approved Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PrincipalGradeApprovalInterface
                grades={approvedGrades}
                onBulkAction={handleBulkAction}
                processing={processing}
                schoolId={schoolId}
                allowRelease={true}
                readOnly={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grading Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Grade Management Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={handleViewGrades}
                  className="h-24 flex flex-col gap-2"
                >
                  <Eye className="h-6 w-6" />
                  <span>View All Grades</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onModalOpen?.("gradeEntry")}
                  className="h-24 flex flex-col gap-2"
                >
                  <Edit className="h-6 w-6" />
                  <span>Manual Grade Entry</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onModalOpen?.("gradeReports")}
                  className="h-24 flex flex-col gap-2"
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>Grade Analytics</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onModalOpen?.("gradingSheet")}
                  className="h-24 flex flex-col gap-2"
                >
                  <GraduationCap className="h-6 w-6" />
                  <span>Teacher Grade Sheet</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default PrincipalGradesSection;
