import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { AuditLogsService } from "@/services/mockAdvancedFeaturesService";
import { DetailedAuditLog, AuditLogFilter } from "@/types/advanced-features";
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Building2,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const DetailedAuditLogsPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<DetailedAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const { toast } = useToast();

  const [filters, setFilters] = useState<AuditLogFilter>({
    action_type: "",
    user_id: "",
    target_school_id: "",
    date_from: "",
    date_to: "",
    limit: pageSize,
    offset: 0,
  });

  const actionTypes = [
    "password_reset",
    "user_created",
    "user_updated",
    "user_deleted",
    "trip_registered",
    "trip_cancelled",
    "payment_processed",
    "login_attempt",
    "permission_changed",
    "system_configuration",
  ];

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "password_reset":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "user_created":
        return <User className="h-4 w-4 text-green-500" />;
      case "user_updated":
        return <Activity className="h-4 w-4 text-blue-500" />;
      case "user_deleted":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "trip_registered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "payment_processed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "login_attempt":
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case "password_reset":
      case "login_attempt":
        return "secondary" as const;
      case "user_created":
      case "trip_registered":
      case "payment_processed":
        return "default" as const;
      case "user_deleted":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await AuditLogsService.getAuditLogs({
        ...filters,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      });

      if (response.success) {
        setAuditLogs(response.data);
        setTotalCount(response.data.length); // In production, get total from pagination metadata
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch audit logs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, filters]);

  const handleFilterChange = (key: keyof AuditLogFilter, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleExport = () => {
    // In production, implement CSV export
    toast({
      title: "Export",
      description: "Export functionality coming soon",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Detailed Audit Logs
          </h1>
          <p className="text-muted-foreground">
            Comprehensive log of all critical actions across the platform
          </p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter audit logs by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select
                value={filters.action_type}
                onValueChange={(value) =>
                  handleFilterChange("action_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  {actionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="Enter user ID"
                value={filters.user_id}
                onChange={(e) => handleFilterChange("user_id", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  handleFilterChange("date_from", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            Showing {auditLogs.length} of {totalCount} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">
                  Loading audit logs...
                </p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action_type)}
                          <Badge
                            variant={getActionBadgeVariant(log.action_type)}
                          >
                            {log.action_type
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.action_description}
                      </TableCell>
                      <TableCell>
                        {log.user_id ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-mono">
                              {log.user_id.slice(0, 8)}...
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.target_user_id && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-mono">
                              {log.target_user_id.slice(0, 8)}...
                            </span>
                          </div>
                        )}
                        {log.target_school_id && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-mono">
                              {log.target_school_id.slice(0, 8)}...
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {log.ip_address || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1)
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedAuditLogsPage;
