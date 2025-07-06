import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { useExaminations } from "@/hooks/useExaminations";
import { Examination } from "@/types/academic";

interface DeleteExaminationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  examination: Examination;
}

const DeleteExaminationModal: React.FC<DeleteExaminationModalProps> = ({
  open,
  onClose,
  onSuccess,
  examination,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deleteExamination } = useExaminations();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteExamination(examination.id);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete examination"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Examination
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
            <p className="text-gray-600 mb-4">
              You are about to delete the examination{" "}
              <strong>"{examination.name}"</strong>. This action cannot be
              undone.
            </p>

            <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
              <p>
                <strong>Exam Type:</strong> {examination.type}
              </p>
              <p>
                <strong>Term:</strong> {examination.term}
              </p>
              <p>
                <strong>Academic Year:</strong> {examination.academic_year}
              </p>
              <p>
                <strong>Target Classes:</strong> {examination.classes.length}{" "}
                class(es)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Examination
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteExaminationModal;
