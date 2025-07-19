import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { AuditService, AuditLog } from "@/services/AuditService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  Database,
  Activity,
  Search,
  Filter,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { format } from "date-fns";

interface AuditLogsViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuditLogsViewer: React.FC<AuditLogsViewerProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: "",
    tableName: "",
    userId: "",
    startDate: "",
    endDate: "",
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Fetch audit logs
  const {
    data: auditLogsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["audit-logs", schoolId, page, filters],
    queryFn: async () => {
      if (!schoolId) return { logs: [], total: 0 };
      return await AuditService.getAuditLogs(
        schoolId,
        filters,
        page,
        50
      );
    },
    enabled: !!schoolId && isOpen,
  });

  // Get action badge color
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "INSERT":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "GRADE_SUBMISSION":
        return "bg-purple-100 text-purple-800";
      case "GRADE_APPROVAL":
        return "bg-green-100 text-green-800";
      case "GRADE_REJECTION":
        return "bg-red-100 text-red-800";
      case "ATTENDANCE_MARKED":
        return "bg-orange-100 text-orange-800";
      case "EXAM_CREATED":
        return "bg-indigo-100 text-indigo-800";
      case "REPORT_GENERATED":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get table badge color
  const getTableBadgeColor = (tableName: string) => {
    switch (tableName) {
      case "grades":
        return "bg-purple-100 text-purple-800";
      case "attendance":
        return "bg-orange-100 text-orange-800";
      case "examinations":
        return "bg-indigo-100 text-indigo-800";
      case "students":
        return "bg-blue-100 text-blue-800";
      case "classes":
        return "bg-green-100 text-green-800";
      case "subjects":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  // Handle log detail view
  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  // Export audit logs
  const handleExport = () => {
    if (!auditLogsData?.logs) return;

    const csvContent = [
      ["Timestamp", "User", "Action", "Table", "Record ID", "Academic Context"],
      ...auditLogsData.logs.map((log) => [
        format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
        log.user_id,
        log.action,
        log.table_name,
        log.record_id || "",
        log.academic_context ? JSON.stringify(log.academic_context) : "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Logs
            <Badge variant="secondary">{auditLogsData?.total || 0} total</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
          <Select
            value={filters.action}
            onValueChange={(value) => handleFilterChange("action", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="INSERT">Insert</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="GRADE_SUBMISSION">Grade Submission</SelectItem>
              <SelectItem value="GRADE_APPROVAL">Grade Approval</SelectItem>
              <SelectItem value="GRADE_REJECTION">Grade Rejection</SelectItem>
              <SelectItem value="ATTENDANCE_MARKED">
                Attendance Marked
              </SelectItem>
              <SelectItem value="EXAM_CREATED">Exam Created</SelectItem>
              <SelectItem value="REPORT_GENERATED">Report Generated</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.tableName}
            onValueChange={(value) => handleFilterChange("tableName", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tables</SelectItem>
              <SelectItem value="grades">Grades</SelectItem>
              <SelectItem value="attendance">Attendance</SelectItem>
              <SelectItem value="examinations">Examinations</SelectItem>
              <SelectItem value="students">Students</SelectItem>
              <SelectItem value="classes">Classes</SelectItem>
              <SelectItem value="subjects">Subjects</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => handleFilterChange("userId", e.target.value)}
          />

          <Input
            type="date"
            placeholder="Start Date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />

          <Input
            type="date"
            placeholder="End Date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />

          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Audit Logs Table */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading audit logs: {error.message}
              </AlertDescription>
            </Alert>
          ) : auditLogsData?.logs?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
              <p className="text-sm">
                {Object.values(filters).some((f) => f)
                  ? "Try adjusting your filters"
                  : "No activity recorded yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Academic Context</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogsData?.logs?.map((log: AuditLog) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.created_at), "MMM d, HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.user_id.substring(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${getActionBadgeColor(log.action)}`}
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${getTableBadgeColor(
                          log.table_name
                        )}`}
                      >
                        {log.table_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.record_id ? (
                        <span className="font-mono text-xs">
                          {log.record_id.substring(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.academic_context ? (
                        <div className="text-xs text-muted-foreground">
                          {log.academic_context.class_id &&
                            `Class: ${log.academic_context.class_id.substring(
                              0,
                              8
                            )}...`}
                          {log.academic_context.subject_id &&
                            ` • Subject: ${log.academic_context.subject_id.substring(
                              0,
                              8
                            )}...`}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {auditLogsData && auditLogsData.total > 50 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(auditLogsData.total / 50)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(auditLogsData.total / 50)}
            >
              Next
            </Button>
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Audit Log Details</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Timestamp</label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedLog.created_at), "PPP p")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">User ID</label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {selectedLog.user_id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Action</label>
                    <Badge className={getActionBadgeColor(selectedLog.action)}>
                      {selectedLog.action}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Table</label>
                    <Badge
                      className={getTableBadgeColor(selectedLog.table_name)}
                    >
                      {selectedLog.table_name}
                    </Badge>
                  </div>
                  {selectedLog.record_id && (
                    <div>
                      <label className="text-sm font-medium">Record ID</label>
                      <p className="text-sm text-muted-foreground font-mono">
                        {selectedLog.record_id}
                      </p>
                    </div>
                  )}
                </div>

                {selectedLog.academic_context && (
                  <div>
                    <label className="text-sm font-medium">
                      Academic Context
                    </label>
                    <pre className="text-sm bg-muted p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(selectedLog.academic_context, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.old_values && (
                  <div>
                    <label className="text-sm font-medium">
                      Previous Values
                    </label>
                    <pre className="text-sm bg-muted p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(
                        JSON.parse(selectedLog.old_values),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}

                {selectedLog.new_values && (
                  <div>
                    <label className="text-sm font-medium">New Values</label>
                    <pre className="text-sm bg-muted p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(
                        JSON.parse(selectedLog.new_values),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default AuditLogsViewer;
