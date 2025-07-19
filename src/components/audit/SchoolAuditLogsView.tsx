
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Download, Filter, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auditLogService, AuditLogEntry } from '@/services/auditLogService';

const SchoolAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, dateRange]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await auditLogService.getSchoolAuditLogs({
        action: actionFilter || undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
        limit: 100
      });

      if (error) {
        throw error;
      }

      setLogs(data);
    } catch (error: any) {
      console.error('Failed to fetch audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    !searchTerm || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target_entity?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadgeColor = (action: string) => {
    if (action.includes('Create') || action.includes('Add')) return 'bg-green-100 text-green-800';
    if (action.includes('Update') || action.includes('Edit')) return 'bg-blue-100 text-blue-800';
    if (action.includes('Delete') || action.includes('Remove')) return 'bg-red-100 text-red-800';
    if (action.includes('Payment')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'User Role', 'Target Entity', 'Details'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.action,
        log.performed_by_role,
        log.target_entity || '',
        JSON.stringify(log.metadata || {})
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            School Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search actions or entities..."
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
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="Grade">Grade Actions</SelectItem>
                <SelectItem value="Attendance">Attendance Actions</SelectItem>
                <SelectItem value="Student">Student Actions</SelectItem>
                <SelectItem value="Payment">Payment Actions</SelectItem>
                <SelectItem value="User">User Actions</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Start date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="End date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredLogs.length} of {logs.length} audit logs
            </p>
            <Button onClick={exportLogs} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Audit Logs Table */}
          <div className="border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading audit logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No audit logs found</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border-b last:border-b-0 p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getActionBadgeColor(log.action)}>
                            {log.action}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            by {log.performed_by_role}
                          </span>
                        </div>
                        
                        {log.target_entity && (
                          <p className="text-sm text-gray-700">
                            Target: {log.target_entity}
                          </p>
                        )}
                        
                        {(log.old_value || log.new_value) && (
                          <div className="text-xs space-y-1">
                            {log.old_value && (
                              <div className="text-red-600">
                                Old: {JSON.stringify(log.old_value)}
                              </div>
                            )}
                            {log.new_value && (
                              <div className="text-green-600">
                                New: {JSON.stringify(log.new_value)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right text-xs text-gray-500">
                        <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAuditLogsView;
