
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, BarChart3 } from "lucide-react";
import BulkGradingTable from "@/components/grading/BulkGradingTable";
import BulkGradeUploadModal from "@/components/grading/BulkGradeUploadModal";
import GradesModal from "@/components/modals/GradesModal";
import { GradingSession } from "@/types/grading";
import { PermissionKey } from "@/utils/permissions";

interface GradeOverviewPanelProps {
  user: any;
  hasPermission: (p: PermissionKey) => boolean;
  mockGradingSession: GradingSession;
  mockClassId: string;
  mockSubjectId: string;
  mockTerm: string;
  mockExamType: "MID_TERM" | "OPENER" | "END_TERM";
  mockMaxScore: number;
  mockStudents: { id: string; name: string }[];

  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  showBulkModal: boolean;
  setShowBulkModal: (b: boolean) => void;

  handleSaveGrades: (grades: { studentId: string; score: number; isAbsent: boolean }[]) => void;
  handleSubmitGrades: () => void;
}

const GradeOverviewPanel: React.FC<GradeOverviewPanelProps> = ({
  user,
  hasPermission,
  mockGradingSession,
  mockClassId,
  mockSubjectId,
  mockTerm,
  mockExamType,
  mockMaxScore,
  mockStudents,
  isModalOpen,
  onOpenModal,
  onCloseModal,
  showBulkModal,
  setShowBulkModal,
  handleSaveGrades,
  handleSubmitGrades
}) => {
  // Roles
  const isAdmin = user?.role === "edufam_admin";
  const canEdit = hasPermission('edit_gradebook'); // Use permission key string
  // No need for PERMISSIONS.VIEW_GRADEBOOK, handled via parent and permission key string

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
          <CardTitle>
            {isAdmin
              ? "Grade Overview (Read-Only)"
              : canEdit
              ? "Manage Grades"
              : "Grade Overview"}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {canEdit && !isAdmin && (
              <>
                <Button onClick={onOpenModal}>Open Grades Modal</Button>
                <Button onClick={() => setShowBulkModal(true)} variant="default">
                  Bulk Upload Grades
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isAdmin ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Administrator Access Level</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                As a system administrator, you can view grade summaries and analytics but cannot enter or modify grades. 
                Grade entry is restricted to teachers and school administrators.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  Sample Grade Data (Read-Only)
                </CardTitle>
                <CardDescription>
                  System-wide grade analytics - Admins have view-only access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkGradingTable 
                  session={mockGradingSession}
                  onSave={handleSaveGrades}
                  onSubmit={handleSubmitGrades}
                  isSubmitted={true}
                />
              </CardContent>
            </Card>
          </div>
        ) : canEdit ? (
          <Tabs defaultValue="bulk" className="w-full space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bulk">Bulk Entry</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="bulk">
              <BulkGradingTable 
                session={mockGradingSession}
                onSave={handleSaveGrades}
                onSubmit={handleSubmitGrades}
              />
            </TabsContent>
            <TabsContent value="analytics">
              <div>Analytics Content</div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Clock className="h-4 w-4" />
                <span className="font-medium">View-Only Access</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                You do not have permission to manage grades. Contact a teacher to enter grades.
              </p>
            </div>
            <BulkGradingTable 
              session={mockGradingSession}
              onSave={handleSaveGrades}
              onSubmit={handleSubmitGrades}
              isSubmitted={true}
            />
          </div>
        )}
      </CardContent>
      {/* Modals */}
      {isModalOpen && (
        <GradesModal onClose={onCloseModal} userRole={user?.role || 'guest'} />
      )}
      {showBulkModal && (
        <BulkGradeUploadModal
          classId={mockClassId}
          subjectId={mockSubjectId}
          term={mockTerm}
          examType={mockExamType}
          maxScore={mockMaxScore}
          students={mockStudents}
          open={showBulkModal}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </Card>
  );
};
export default GradeOverviewPanel;

