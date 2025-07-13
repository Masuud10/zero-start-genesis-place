import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";
import { usePrincipalGradeManagement } from "@/hooks/usePrincipalGradeManagement";
import {
  Award,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BatchData {
  id: string;
  classes?: { name: string };
  profiles?: { name: string };
  term?: string;
  exam_type?: string;
  total_students?: number;
  grades_entered?: number;
  submitted_at: string;
  status: string;
  batch_name?: string;
}

interface GradeData {
  id: string;
  term?: string;
  exam_type?: string;
  submitted_at: string;
  status: string;
  class_id: string;
  submitted_by: string;
  subject_id: string;
  subjects?: { name: string };
  classes?: { name: string };
  profiles?: { name: string };
}

interface UpdateData {
  status: string;
  approval_workflow_stage?: string;
  approved_by?: string;
  approved_at?: string;
  is_released?: boolean;
  released_to_parents?: boolean;
  released_by?: string;
  released_at?: string;
}

interface GradeSubmissionBatch {
  id: string;
  class_name: string;
  subject_names: string[];
  teacher_name: string;
  term: string;
  exam_type: string;
  total_students: number;
  grades_entered: number;
  submitted_at: string;
  status: string;
  batch_name: string;
}

const EnhancedGradeApprovalDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  // Use the hook that already handles the database relationships properly
  const {
    grades,
    isLoading,
    processing,
    handleApproveGrades,
    handleRejectGrades,
    handleReleaseGrades,
  } = usePrincipalGradeManagement();

  const [submissions, setSubmissions] = useState<GradeSubmissionBatch[]>([]);

  // Process grades into submission batches
  useEffect(() => {
    if (!grades) return;

    const submissionMap = new Map<string, GradeSubmissionBatch>();
    
    grades.forEach((grade) => {
      if (!grade.students?.name || !grade.subjects?.name || !grade.classes?.name) {
        return; // Skip if missing required relationship data
      }
      
      const key = `${grade.class_id}-${grade.term}-${grade.exam_type}-${grade.submitted_by}`;
      
      if (!submissionMap.has(key)) {
        submissionMap.set(key, {
          id: key,
          class_name: grade.classes.name,
          subject_names: [grade.subjects.name],
          teacher_name: grade.profiles?.name || "Unknown Teacher",
          term: grade.term,
          exam_type: grade.exam_type,
          total_students: 1,
          grades_entered: 1,
          submitted_at: grade.submitted_at,
          status: grade.status,
          batch_name: `${grade.term} - ${grade.exam_type}`,
        });
      } else {
        const submission = submissionMap.get(key)!;
        submission.grades_entered++;
        
        // Add subject if not already included
        if (!submission.subject_names.includes(grade.subjects.name)) {
          submission.subject_names.push(grade.subjects.name);
        }
      }
    });

    setSubmissions(Array.from(submissionMap.values()));
  }, [grades]);

  const handleBatchAction = async (
    submissionId: string,
    action: "approve" | "reject" | "release"
  ) => {
    try {
      // Extract grade IDs from the submission
      const submission = submissions.find((s) => s.id === submissionId);
      if (!submission) return;

      // Find matching grades from the hook data
      const matchingGrades = grades.filter(
        (grade) =>
          grade.class_id === submission.id.split('-')[0] &&
          grade.term === submission.term &&
          grade.exam_type === submission.exam_type
      );

      const gradeIds = matchingGrades.map((g) => g.id);

      if (gradeIds.length === 0) {
        toast({
          title: "Error",
          description: "No grades found for this submission",
          variant: "destructive",
        });
        return;
      }

      // Use the hook's methods which already handle the database relationships
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
    } catch (error: unknown) {
      console.error(`Error ${action}ing grades:`, error);
      const errorMessage =
        error instanceof Error ? error.message : `Failed to ${action} grades`;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case "released":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 flex items-center gap-1"
          >
            <Send className="h-3 w-3" />
            Released
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2">Loading grade submissions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Grade Approval Dashboard
        </CardTitle>
        <p className="text-gray-600 text-sm">
          Review and approve teacher grade submissions
        </p>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No grade submissions pending approval. Teachers will submit grades
              here for your review.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Grades</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {submission.batch_name}
                    </TableCell>
                    <TableCell>{submission.class_name}</TableCell>
                    <TableCell>{submission.teacher_name}</TableCell>
                    <TableCell>{submission.term}</TableCell>
                    <TableCell>{submission.exam_type}</TableCell>
                    <TableCell>{submission.grades_entered} entries</TableCell>
                    <TableCell>
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processing === submission.id}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {submission.status === "submitted" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleBatchAction(submission.id, "approve")
                              }
                              disabled={processing === submission.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              title="Approve Grades"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleBatchAction(submission.id, "reject")
                              }
                              disabled={processing === submission.id}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              title="Reject Grades"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {submission.status === "approved" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleBatchAction(submission.id, "release")
                            }
                            disabled={processing === submission.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            title="Release to Parents"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedGradeApprovalDashboard;
