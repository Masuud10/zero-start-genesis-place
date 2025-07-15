import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useStudentTransportAssignments } from '@/hooks/transport/useStudentTransportAssignments';

interface Student {
  id: string;
  name: string;
  admission_number: string;
}

interface AssignStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeId?: number;
  onSuccess: () => void;
}

export const AssignStudentDialog = ({ open, onOpenChange, routeId, onSuccess }: AssignStudentDialogProps) => {
  const { createAssignment, fetchUnassignedStudents } = useStudentTransportAssignments();
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (open) {
      loadUnassignedStudents();
    }
  }, [open]);

  const loadUnassignedStudents = async () => {
    const students = await fetchUnassignedStudents();
    setUnassignedStudents(students);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !routeId) return;

    setLoading(true);
    try {
      const success = await createAssignment({
        student_id: selectedStudentId,
        route_id: routeId,
      });

      if (success) {
        setSelectedStudentId('');
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Student to Transport Route</DialogTitle>
          <DialogDescription>
            Select a student to assign to this transport route.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student">Student *</Label>
              <Select 
                value={selectedStudentId} 
                onValueChange={setSelectedStudentId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.admission_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {unassignedStudents.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No unassigned students available
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                setSelectedStudentId('');
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedStudentId || unassignedStudents.length === 0}
            >
              {loading ? 'Assigning...' : 'Assign Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};