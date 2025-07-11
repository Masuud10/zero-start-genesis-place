import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  X,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAdminCommunications } from "@/hooks/useAdminCommunications";
import { AdminCommunication } from "@/types/communications";
import { format } from "date-fns";

const AdminCommunicationsBanner: React.FC = () => {
  const { communications, isLoading, dismissCommunication, isDismissing } =
    useAdminCommunications();
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  // Don't render if no communications
  if (!communications || communications.length === 0) {
    return null;
  }

  const handleDismiss = async (communication: AdminCommunication) => {
    if (!communication.dismissible) return;

    setDismissingId(communication.id);
    try {
      await dismissCommunication(communication.id);
    } finally {
      setDismissingId(null);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "medium":
        return <Info className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6 border-yellow-200 bg-yellow-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-yellow-700">
              Loading communications...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-yellow-700" />
            <h3 className="font-semibold text-yellow-800 text-lg">
              EduFam Admin Communications
            </h3>
            <Badge
              variant="secondary"
              className="bg-yellow-200 text-yellow-800"
            >
              {communications.length}{" "}
              {communications.length === 1 ? "message" : "messages"}
            </Badge>
          </div>
        </div>

        <ScrollArea className="max-h-64">
          <div className="space-y-3">
            {communications.map((communication) => (
              <div
                key={communication.id}
                className="bg-white rounded-lg border border-yellow-200 p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityIcon(communication.priority)}
                      <h4 className="font-medium text-gray-900 text-sm">
                        {communication.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getPriorityColor(
                          communication.priority
                        )}`}
                      >
                        {communication.priority}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                      {communication.message}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(
                            new Date(communication.created_at),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </span>
                      </div>

                      {communication.expires_at && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>
                            Expires:{" "}
                            {format(
                              new Date(communication.expires_at),
                              "MMM dd, yyyy"
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {communication.dismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(communication)}
                      disabled={
                        isDismissing && dismissingId === communication.id
                      }
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      {isDismissing && dismissingId === communication.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminCommunicationsBanner;
