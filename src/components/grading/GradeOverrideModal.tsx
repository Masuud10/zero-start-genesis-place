import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Save, X } from "lucide-react";

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

interface GradeOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: Grade | null;
  onSuccess?: () => void;
  principalId: string;
}

export const GradeOverrideModal: React.FC<GradeOverrideModalProps> = ({
  isOpen,
  onClose,
  grade,
  onSuccess,
  principalId,
}) => {
  const { toast } = useToast();
  const [newScore, setNewScore] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [processing, setProcessing] = useState(false);

  React.useEffect(() => {
    if (grade && isOpen) {
      setNewScore(grade.score?.toString() || "");
      setOverrideReason("");
    }
  }, [grade, isOpen]);

  const calculateLetterGrade = (score: number, maxScore: number = 100): string => {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";
    if (percentage >= 30) return "D+";
    if (percentage >= 20) return "D";
    return "E";
  };

  const handleOverride = async () => {
    if (!grade || !newScore || !overrideReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a new score and reason for override.",
        variant: "destructive",
      });
      return;
    }

    const scoreValue = parseFloat(newScore);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > (grade.max_score || 100)) {
      toast({
        title: "Invalid Score",
        description: `Score must be between 0 and ${grade.max_score || 100}.`,
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    try {
      const maxScore = grade.max_score || 100;
      const percentage = Math.round((scoreValue / maxScore) * 100 * 100) / 100;
      const letterGrade = calculateLetterGrade(scoreValue, maxScore);

      // Update the grade with override information
      const { error } = await supabase
        .from("grades")
        .update({
          score: scoreValue,
          percentage: percentage,
          letter_grade: letterGrade,
          status: "approved", // Override automatically approves
          overridden_by: principalId,
          overridden_at: new Date().toISOString(),
          override_reason: overrideReason,
          approved_by: principalId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", grade.id);

      if (error) throw error;

      // Log the override action
      await supabase.from("audit_logs").insert({
        action: "grade_override",
        performed_by_user_id: principalId,
        performed_by_role: "principal",
        target_entity: "grades",
        old_value: {
          score: grade.score,
          percentage: grade.percentage,
          letter_grade: grade.letter_grade,
          status: grade.status,
        },
        new_value: {
          score: scoreValue,
          percentage: percentage,
          letter_grade: letterGrade,
          status: "approved",
          override_reason: overrideReason,
        },
        metadata: {
          grade_id: grade.id,
          student_id: grade.student_id,
          subject_id: grade.subject_id,
          class_id: grade.class_id,
          term: grade.term,
          exam_type: grade.exam_type,
        },
      });

      toast({
        title: "Grade Override Successful",
        description: `Grade updated from ${grade.score} to ${scoreValue} (${letterGrade}).`,
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error overriding grade:", error);
      toast({
        title: "Override Failed",
        description: error.message || "Failed to override grade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!grade) return null;

  const currentPercentage = grade.score && grade.max_score 
    ? Math.round((grade.score / grade.max_score) * 100 * 100) / 100 
    : 0;
  
  const newPercentage = newScore && grade.max_score 
    ? Math.round((parseFloat(newScore) / grade.max_score) * 100 * 100) / 100 
    : 0;

  const newLetterGrade = newScore && grade.max_score 
    ? calculateLetterGrade(parseFloat(newScore), grade.max_score)
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Override Grade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Grade Information */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Grade Information</h4>
            <p className="text-sm text-gray-600">
              <strong>Student:</strong> {grade.students?.name || "Unknown"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Subject:</strong> {grade.subjects?.name || "Unknown"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Class:</strong> {grade.classes?.name || "Unknown"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Term:</strong> {grade.term} • <strong>Exam:</strong> {grade.exam_type}
            </p>
          </div>

          {/* Current Grade */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Current Grade</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Score</p>
                <p className="font-semibold">{grade.score || 0}/{grade.max_score || 100}</p>
              </div>
              <div>
                <p className="text-gray-600">Percentage</p>
                <p className="font-semibold">{currentPercentage}%</p>
              </div>
              <div>
                <p className="text-gray-600">Grade</p>
                <p className="font-semibold">{grade.letter_grade || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* New Grade Input */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="newScore">New Score</Label>
              <Input
                id="newScore"
                type="number"
                min="0"
                max={grade.max_score || 100}
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                placeholder={`Enter score (0-${grade.max_score || 100})`}
              />
              {newScore && (
                <div className="mt-2 text-sm text-gray-600 bg-green-50 p-2 rounded">
                  New grade: <strong>{newScore}/{grade.max_score || 100}</strong> 
                  ({newPercentage}% - {newLetterGrade})
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="reason">Override Reason</Label>
              <Textarea
                id="reason"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why this grade is being overridden..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={processing}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleOverride} 
            disabled={processing || !newScore || !overrideReason.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {processing ? "Overriding..." : "Override Grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};