import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { GradeWorkflowService } from "@/services/gradeWorkflowService";
import {
  CheckCircle,
  XCircle,
  Edit,
  Send,
  Eye,
  Clock,
  AlertTriangle,
  Users,
  BookOpen,
} from "lucide-react";

interface GradeWorkflowManagerProps {
  onRefresh?: () => void;
}

interface PendingGrade {
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
  principal_notes?: string;
  students: { id: string; name: string; admission_number: string };
  subjects: { id: string; name: string; code: string };
  classes: { id: string; name: string };
  submitted_profile: { id: string; name: string };
}

const GradeWorkflowManager: React.FC<GradeWorkflowManagerProps> = ({
  onRefresh,
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  
  const [pendingGrades, setPendingGrades] = useState<PendingGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [actionModal, setActionModal] = useState<{
    type: 'approve' | 'reject' | 'override' | 'release' | null;
    gradeId?: string;
  }>({ type: null });
  const [principalNotes, setPrincipalNotes] = useState("");
  const [overrideScore, setOverrideScore] = useState<number>(0);

  // Fetch pending grades for principal review
  const fetchPendingGrades = async () => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      const grades = await GradeWorkflowService.fetchPendingGrades(schoolId);
      setPendingGrades(grades);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending grades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPendingGrades();
  }, [schoolId]);

  const handleGradeAction = async () => {
    if (!user?.id || !actionModal.type) return;
    
    setLoading(true);
    try {
      const gradeIds = actionModal.gradeId ? [actionModal.gradeId] : selectedGrades;
      
      switch (actionModal.type) {
        case 'approve':
          await GradeWorkflowService.approveGrades(
            { gradeIds, action: 'approve', principalNotes },
            user.id
          );
          toast({
            title: "Success",
            description: `${gradeIds.length} grade(s) approved successfully`,
          });
          break;
          
        case 'reject':
          await GradeWorkflowService.rejectGrades(
            { gradeIds, action: 'reject', rejectionReason: principalNotes },
            user.id
          );
          toast({
            title: "Success",
            description: `${gradeIds.length} grade(s) rejected`,
          });
          break;
          
        case 'override':
          if (actionModal.gradeId) {
            await GradeWorkflowService.overrideGrade(
              { gradeId: actionModal.gradeId, newScore: overrideScore, principalNotes },
              user.id
            );
            toast({
              title: "Success",
              description: "Grade overridden successfully",
            });
          }
          break;
          
        case 'release':
          await GradeWorkflowService.releaseGrades(
            { gradeIds, action: 'release' },
            user.id
          );
          toast({
            title: "Success",
            description: `${gradeIds.length} grade(s) released to parents`,
          });
          break;
      }
      
      // Refresh data
      await fetchPendingGrades();
      onRefresh?.();
      
      // Reset state
      setActionModal({ type: null });
      setPrincipalNotes("");
      setOverrideScore(0);
      setSelectedGrades([]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${actionModal.type} grades`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      pending_approval: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
      released: { color: "bg-blue-100 text-blue-800", label: "Released" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (user?.role !== 'principal') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            This feature is only available to principals.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Grade Approval Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Grades pending your approval: {pendingGrades.length}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={fetchPendingGrades}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {selectedGrades.length > 0 && (
                <>
                  <Button
                    onClick={() => setActionModal({ type: 'approve' })}
                    size="sm"
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Selected ({selectedGrades.length})
                  </Button>
                  <Button
                    onClick={() => setActionModal({ type: 'reject' })}
                    variant="destructive"
                    size="sm"
                    disabled={loading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Selected ({selectedGrades.length})
                  </Button>
                </>
              )}
            </div>
          </div>

          {pendingGrades.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No grades pending approval</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGrades(pendingGrades.map(g => g.id));
                        } else {
                          setSelectedGrades([]);
                        }
                      }}
                      checked={selectedGrades.length === pendingGrades.length}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedGrades.includes(grade.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGrades([...selectedGrades, grade.id]);
                          } else {
                            setSelectedGrades(selectedGrades.filter(id => id !== grade.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{grade.students.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {grade.students.admission_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{grade.subjects.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {grade.subjects.code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{grade.classes.name}</TableCell>
                    <TableCell>
                      {grade.score}/{grade.max_score} ({grade.percentage}%)
                    </TableCell>
                    <TableCell>{grade.letter_grade}</TableCell>
                    <TableCell>{grade.submitted_profile.name}</TableCell>
                    <TableCell>{getStatusBadge(grade.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => setActionModal({ type: 'approve', gradeId: grade.id })}
                          size="sm"
                          variant="outline"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setActionModal({ type: 'reject', gradeId: grade.id })}
                          size="sm"
                          variant="outline"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setActionModal({ type: 'override', gradeId: grade.id })}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Modal */}
      <Dialog 
        open={actionModal.type !== null} 
        onOpenChange={() => setActionModal({ type: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionModal.type === 'approve' && 'Approve Grades'}
              {actionModal.type === 'reject' && 'Reject Grades'}
              {actionModal.type === 'override' && 'Override Grade'}
              {actionModal.type === 'release' && 'Release Grades'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {actionModal.type === 'override' && (
              <div>
                <Label htmlFor="override-score">New Score</Label>
                <Input
                  id="override-score"
                  type="number"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(Number(e.target.value))}
                  placeholder="Enter new score"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="principal-notes">
                {actionModal.type === 'reject' ? 'Rejection Reason' : 'Principal Notes (Optional)'}
              </Label>
              <Textarea
                id="principal-notes"
                value={principalNotes}
                onChange={(e) => setPrincipalNotes(e.target.value)}
                placeholder={
                  actionModal.type === 'reject' 
                    ? "Please provide a reason for rejection..."
                    : "Add notes about this action..."
                }
                required={actionModal.type === 'reject'}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionModal({ type: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGradeAction}
              disabled={loading || (actionModal.type === 'reject' && !principalNotes.trim())}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GradeWorkflowManager;