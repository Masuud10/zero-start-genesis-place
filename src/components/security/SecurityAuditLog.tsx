
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  success: boolean;
  error_message?: string;
  metadata: any;
  created_at: string;
}

const SecurityAuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      setLogs(data || []);
    } catch (error: any) {
      console.error('Failed to fetch audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const getActionBadge = (action: string, success: boolean) => {
    const baseClasses = "text-xs";
    
    if (!success) {
      return <Badge variant="destructive" className={baseClasses}>{action}</Badge>;
    }
    
    switch (action) {
      case 'SIGNED_IN':
      case 'INSERT':
        return <Badge variant="default" className={`${baseClasses} bg-green-100 text-green-800`}>{action}</Badge>;
      case 'SIGNED_OUT':
      case 'DELETE':
        return <Badge variant="secondary" className={baseClasses}>{action}</Badge>;
      case 'UPDATE':
        return <Badge variant="outline" className={baseClasses}>{action}</Badge>;
      default:
        return <Badge variant="outline" className={baseClasses}>{action}</Badge>;
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Security Audit Log
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAuditLogs}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">No audit logs found</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(log.success)}
                  <div>
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action, log.success)}
                      <span className="text-sm font-medium">{log.resource}</span>
                      {log.resource_id && (
                        <span className="text-xs text-gray-500">
                          ({log.resource_id.slice(0, 8)}...)
                        </span>
                      )}
                    </div>
                    {log.error_message && (
                      <p className="text-xs text-red-600 mt-1">{log.error_message}</p>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityAuditLog;
