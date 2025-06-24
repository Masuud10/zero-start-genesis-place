
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Search, Download, Filter, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auditLogService, AuditLogEntry } from '@/services/auditLogService';
import { supabase } from '@/integrations/supabase/client';

interface School {
  id: string;
  name: string;
}

const SystemAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
    fetchAuditLogs();
  }, [actionFilter, schoolFilter, dateRange]);

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await auditLogService.getSystemAuditLogs({
        action: actionFilter || undefined,
        school_id: schoolFilter || undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
        limit: 200
      });

      if (error) {
        throw error;
      }

      setLogs(data);
    } catch (error: any) {
      console.error('Failed to fetch system audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load system audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    !searchTerm || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target_entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.performed_by_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadgeColor = (action: string) => {
    if (action.includes('Delete') || action.includes('Deactivate')) return 'bg-red-100 text-red-800 border-red-200';
    if (action.includes('Create') || action.includes('Register')) return 'bg-green-100 text-green-800 border-green-200';
    if (action.includes('Update') || action.includes('Modify')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (action.includes('System') || action.includes('Config')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (action.includes('Finance') || action.includes('Payment')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === 'edufam_admin' || role === 'elimisha_admin') return 'bg-red-100 text-red-800';
    if (role === 'principal' || role === 'school_owner') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school?.name || 'Unknown School';
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'User Role', 'School', 'Target Entity', 'Old Value', 'New Value'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.action,
        log.performed_by_role,
        log.school_id ? getSchoolName(log.school_id) : 'System',
        log.target_entity || '',
        JSON.stringify(log.old_value || {}),
        JSON.stringify(log.new_value || {})
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isCriticalAction = (action: string) => {
    return action.includes('Delete') || action.includes('Deactivate') || action.includes('System');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Audit Logs
            <Badge variant="outline" className="ml-auto">
              EduFam Admin Only
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
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
                <SelectItem value="School">School Actions</SelectItem>
                <SelectItem value="User">User Actions</SelectItem>
                <SelectItem value="System">System Actions</SelectItem>
                <SelectItem value="Delete">Deletions</SelectItem>
                <SelectItem value="Finance">Finance Actions</SelectItem>
                <SelectItem value="Config">Configuration</SelectItem>
              </SelectContent>
            </Select>

            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Schools</SelectItem>
                {schools.map(school => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
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
              Showing {filteredLogs.length} of {logs.length} system audit logs
            </p>
            <Button onClick={exportLogs} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* System Audit Logs Table */}
          <div className="border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading system audit logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No system audit logs found</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div key={log.id} className={`border-b last:border-b-0 p-4 hover:bg-gray-50 ${isCriticalAction(log.action) ? 'bg-red-50 border-l-4 border-l-red-500' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {isCriticalAction(log.action) && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge className={getActionBadgeColor(log.action)}>
                            {log.action}
                          </Badge>
                          <Badge variant="outline" className={getRoleBadgeColor(log.performed_by_role)}>
                            {log.performed_by_role}
                          </Badge>
                          {log.school_id && (
                            <Badge variant="secondary">
                              {getSchoolName(log.school_id)}
                            </Badge>
                          )}
                        </div>
                        
                        {log.target_entity && (
                          <p className="text-sm text-gray-700">
                            Target: {log.target_entity}
                          </p>
                        )}
                        
                        {(log.old_value || log.new_value) && (
                          <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                            {log.old_value && (
                              <div className="text-red-600">
                                <span className="font-medium">Before:</span> {JSON.stringify(log.old_value)}
                              </div>
                            )}
                            {log.new_value && (
                              <div className="text-green-600">
                                <span className="font-medium">After:</span> {JSON.stringify(log.new_value)}
                              </div>
                            )}
                          </div>
                        )}

                        {log.ip_address && (
                          <p className="text-xs text-gray-500">
                            IP: {log.ip_address}
                          </p>
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

export default SystemAuditLogsView;
