
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Grade } from '@/types';

interface GradeOverrideRequestProps {
  grade: Grade;
  onClose: () => void;
  onSubmit: (request: { newScore: number; reason: string }) => void;
}

const GradeOverrideRequest = ({ grade, onClose, onSubmit }: GradeOverrideRequestProps) => {
  const [newScore, setNewScore] = useState(grade.score.toString());
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the grade override request.",
        variant: "destructive",
      });
      return;
    }

    const newScoreNum = parseFloat(newScore);
    if (isNaN(newScoreNum) || newScoreNum < 0 || newScoreNum > grade.maxScore) {
      toast({
        title: "Invalid Score",
        description: `Score must be between 0 and ${grade.maxScore}.`,
        variant: "destructive",
      });
      return;
    }

    if (newScoreNum === grade.score) {
      toast({
        title: "No Change",
        description: "The new score is the same as the current score.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      onSubmit({ newScore: newScoreNum, reason: reason.trim() });
      toast({
        title: "Override Request Submitted",
        description: "Your grade override request has been submitted for admin approval.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit override request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Grade Override</DialogTitle>
          <DialogDescription>
            This grade is immutable. Submit a request for admin approval to modify it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Score</Label>
            <Input 
              value={`${grade.score}/${grade.maxScore} (${((grade.score / grade.maxScore) * 100).toFixed(1)}%)`}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-score">New Score *</Label>
            <Input
              id="new-score"
              type="number"
              min="0"
              max={grade.maxScore}
              step="0.1"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              placeholder={`Enter score (0-${grade.maxScore})`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Override *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this grade needs to be changed..."
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GradeOverrideRequest;
