import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { Shield, User, Clock, Edit, Search, Filter } from "lucide-react";

interface GradeValues {
  score?: number;
  percentage?: number;
  letter_grade?: string;
  cbc_performance_level?: string;
  strand_scores?: Record<string, string>;
  teacher_remarks?: string;
  status?: string;
  [key: string]: unknown;
}

interface AuditMetadata {
  class_id?: string;
  subject_id?: string;
  student_id?: string;
  term?: string;
  exam_type?: string;
  reason?: string;
  [key: string]: unknown;
}

interface AuditLog {
  id: string;
  action: string;
  user_name: string;
  user_role: string;
  created_at: string;
  old_values: GradeValues | null;
  new_values: GradeValues | null;
  metadata: AuditMetadata | null;
  ip_address: string;
  user_agent: string;
}

interface DatabaseAuditLog {
  id: string;
  action: string;
  created_at: string;
  old_value: any;
  new_value: any;
  metadata: any;
  ip_address: unknown;
  user_agent: string | null;
  profiles?: {
    name: string;
    role: string;
  } | null;
}

export const GradeAuditLogger: React.FC = () => {
  const { schoolId } = useSchoolScopedData();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    loadAuditLogs();
  }, [schoolId]);

  useEffect(() => {
    filterLogs();
  }, [auditLogs, searchTerm, actionFilter, roleFilter]);

  const loadAuditLogs = async () => {
    if (!schoolId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select(
          `
          *,
          profiles!audit_logs_performed_by_user_id_fkey(name, role)
        `
        )
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const processedLogs = (data || []).map((log: any) => ({
        id: log.id,
        action: log.action,
        created_at: log.created_at,
        old_values: log.old_value as GradeValues | null,
        new_values: log.new_value as GradeValues | null,
        metadata: log.metadata as AuditMetadata | null,
        ip_address: log.ip_address ? String(log.ip_address) : "",
        user_agent: log.user_agent || "",
        user_name: log.profiles?.name || "Unknown User",
        user_role: log.profiles?.role || "unknown",
      })) as AuditLog[];

      setAuditLogs(processedLogs);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = auditLogs;

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((log) => log.user_role === roleFilter);
    }

    setFilteredLogs(filtered);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "APPROVE":
        return "bg-purple-100 text-purple-800";
      case "REJECT":
        return "bg-orange-100 text-orange-800";
      case "RELEASE":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "principal":
        return "bg-purple-100 text-purple-800";
      case "teacher":
        return "bg-blue-100 text-blue-800";
      case "edufam_admin":
        return "bg-red-100 text-red-800";
      case "elimisha_admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getChangesSummary = (
    oldValues: GradeValues | null,
    newValues: GradeValues | null
  ) => {
    if (!oldValues || !newValues) return "No details available";

    const changes: string[] = [];
    for (const [key, newValue] of Object.entries(newValues)) {
      const oldValue = oldValues[key];
      if (oldValue !== newValue) {
        changes.push(`${key}: ${oldValue} → ${newValue}`);
      }
    }

    return changes.length > 0 ? changes.join(", ") : "No changes detected";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Grade Audit Trail
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Last 100 actions
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by user or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="APPROVE">Approve</SelectItem>
              <SelectItem value="REJECT">Reject</SelectItem>
              <SelectItem value="RELEASE">Release</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="principal">Principal</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="edufam_admin">EduFam Admin</SelectItem>
              <SelectItem value="elimisha_admin">Elimisha Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audit Logs */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
              <p className="text-sm">
                {auditLogs.length === 0
                  ? "No grade activities recorded yet"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="font-medium text-sm">{log.user_name}</span>
                    <Badge
                      className={getRoleColor(log.user_role)}
                      variant="outline"
                    >
                      {log.user_role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(log.created_at)}
                  </div>
                </div>

                {(log.old_values || log.new_values) && (
                  <div className="bg-gray-50 rounded p-2 text-xs">
                    <div className="flex items-center gap-1 text-gray-600 mb-1">
                      <Edit className="h-3 w-3" />
                      Changes:
                    </div>
                    <div className="text-gray-700">
                      {getChangesSummary(log.old_values, log.new_values)}
                    </div>
                  </div>
                )}

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="text-xs text-gray-600">
                    Additional info: {JSON.stringify(log.metadata)}
                  </div>
                )}

                {log.ip_address && (
                  <div className="text-xs text-gray-500">
                    IP: {log.ip_address}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
