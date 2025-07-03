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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Grade Management Overview
        </h2>
        <Button
          variant="outline"
          onClick={handleViewGrades}
          className="flex items-center gap-2"
        >
          <GraduationCap className="w-4 h-4" />
          Full Grade Management
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="management">Grade Approval</TabsTrigger>
          <TabsTrigger value="grading">Grading Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleViewGrades}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Grades Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">
                    {isLoading ? "..." : pendingGrades.length}
                  </div>
                  <p className="text-sm text-orange-700">Pending Review</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">
                    {isLoading ? "..." : approvedGrades.length}
                  </div>
                  <p className="text-sm text-green-700">Approved</p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">
                    {isLoading ? "..." : releasedGrades.length}
                  </div>
                  <p className="text-sm text-blue-700">Released to Parents</p>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold text-red-600">
                    {isLoading ? "..." : rejectedGrades.length}
                  </div>
                  <p className="text-sm text-red-700">Rejected</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={handleViewGrades}
                  className="w-full"
                >
                  Manage All Grades
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Grade Approval & Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PrincipalGradeApprovalInterface
                grades={grades}
                onBulkAction={handleBulkAction}
                processing={processing}
                schoolId={schoolId}
                allowRelease={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Principal Grading Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeacherGradesManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default PrincipalGradesSection;
