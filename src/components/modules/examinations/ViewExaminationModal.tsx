import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  BookOpen,
  User,
  FileText,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { useTeachers } from "@/hooks/useTeachers";
import { Examination } from "@/types/academic";

interface ViewExaminationModalProps {
  open: boolean;
  onClose: () => void;
  examination: Examination;
}

const ViewExaminationModal: React.FC<ViewExaminationModalProps> = ({
  open,
  onClose,
  examination,
}) => {
  const { classes } = useClasses();
  const { teachers } = useTeachers();

  // Get class names for display
  const getClassNames = (classIds: string[]) => {
    return classIds
      .map((id) => classes.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  // Get coordinator name
  const getCoordinatorName = (coordinatorId?: string) => {
    if (!coordinatorId) return "Not assigned";
    const coordinator = teachers.find((t) => t.id === coordinatorId);
    return coordinator?.name || "Unknown";
  };

  // Calculate duration
  const getDuration = () => {
    const startDate = new Date(examination.start_date);
    const endDate = new Date(examination.end_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? "1 day" : `${diffDays} days`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Examination Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{examination.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Type:</span>
                  <Badge variant="outline">{examination.type}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Term:</span>
                  <Badge variant="secondary">{examination.term}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Academic Year:</span>
                  <span>{examination.academic_year}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Duration:</span>
                  <span>{getDuration()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Start Date:
                  </span>
                  <p className="text-sm">
                    {formatDate(examination.start_date)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    End Date:
                  </span>
                  <p className="text-sm">{formatDate(examination.end_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Target Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {examination.classes.map((classId) => {
                  const className = classes.find((c) => c.id === classId)?.name;
                  return className ? (
                    <Badge key={classId} variant="outline">
                      {className}
                    </Badge>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>

          {/* Coordinator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Exam Coordinator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {getCoordinatorName(examination.coordinator_id)}
              </p>
            </CardContent>
          </Card>

          {/* Remarks */}
          {examination.remarks && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Remarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {examination.remarks}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Created Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">
                Created Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>
                  Created:{" "}
                  {new Date(examination.created_at).toLocaleDateString()}
                </p>
                <p>
                  Last Updated:{" "}
                  {new Date(examination.updated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewExaminationModal;
