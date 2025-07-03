import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface DebugInfo {
  authentication: {
    status: 'connected' | 'disconnected' | 'error';
    userId?: string;
    userRole?: string;
    userEmail?: string;
  };
  schoolContext: {
    status: 'connected' | 'disconnected' | 'error';
    schoolId?: string;
    isReady: boolean;
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    lastQuery?: Date;
    errors: string[];
  };
  components: {
    stats: 'loading' | 'loaded' | 'error';
    analytics: 'loading' | 'loaded' | 'error';
    grades: 'loading' | 'loaded' | 'error';
    timetable: 'loading' | 'loaded' | 'error';
    finance: 'loading' | 'loaded' | 'error';
    certificates: 'loading' | 'loaded' | 'error';
  };
}

const PrincipalDashboardDebugger: React.FC = () => {
  const { user } = useAuth();
  const { schoolId, isReady, validateSchoolAccess } = useSchoolScopedData();
  const { stats, loading, error } = usePrincipalDashboardData(schoolId);
  
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    authentication: { status: 'disconnected' },
    schoolContext: { status: 'disconnected', isReady: false },
    database: { status: 'disconnected', errors: [] },
    components: {
      stats: 'loading',
      analytics: 'loading',
      grades: 'loading',
      timetable: 'loading',
      finance: 'loading',
      certificates: 'loading'
    }
  });

  const [isDebugging, setIsDebugging] = useState(false);

  const runDiagnostics = async () => {
    setIsDebugging(true);
    const newDebugInfo: DebugInfo = {
      authentication: { status: 'disconnected' },
      schoolContext: { status: 'disconnected', isReady: false },
      database: { status: 'disconnected', errors: [] },
      components: {
        stats: 'loading',
        analytics: 'loading',
        grades: 'loading',
        timetable: 'loading',
        finance: 'loading',
        certificates: 'loading'
      }
    };

    try {
      // Check Authentication
      if (user) {
        newDebugInfo.authentication = {
          status: 'connected',
          userId: user.id,
          userRole: user.role,
          userEmail: user.email
        };
      } else {
        newDebugInfo.authentication.status = 'error';
      }

      // Check School Context
      newDebugInfo.schoolContext = {
        status: schoolId ? 'connected' : 'error',
        schoolId: schoolId || undefined,
        isReady
      };

      // Check Database Connection
      try {
        const { data, error: dbError } = await supabase
          .from('schools')
          .select('id')
          .limit(1);
        
        if (dbError) {
          newDebugInfo.database = {
            status: 'error',
            errors: [dbError.message]
          };
        } else {
          newDebugInfo.database = {
            status: 'connected',
            lastQuery: new Date(),
            errors: []
          };
        }
      } catch (dbErr: any) {
        newDebugInfo.database = {
          status: 'error',
          errors: [dbErr.message || 'Database connection failed']
        };
      }

      // Check Component Status
      newDebugInfo.components.stats = loading ? 'loading' : (error ? 'error' : 'loaded');
      
      // Test other API endpoints
      if (schoolId) {
        try {
          const [gradesTest, timetableTest, financeTest] = await Promise.allSettled([
            supabase.from('grades').select('id').eq('school_id', schoolId).limit(1),
            supabase.from('timetables').select('id').eq('school_id', schoolId).limit(1),
            supabase.from('financial_transactions').select('id').eq('school_id', schoolId).limit(1)
          ]);

          newDebugInfo.components.grades = gradesTest.status === 'fulfilled' ? 'loaded' : 'error';
          newDebugInfo.components.timetable = timetableTest.status === 'fulfilled' ? 'loaded' : 'error';
          newDebugInfo.components.finance = financeTest.status === 'fulfilled' ? 'loaded' : 'error';
        } catch {
          newDebugInfo.components.grades = 'error';
          newDebugInfo.components.timetable = 'error';
          newDebugInfo.components.finance = 'error';
        }
      }

      setDebugInfo(newDebugInfo);
    } catch (err: any) {
      console.error('Debug diagnostics failed:', err);
    } finally {
      setIsDebugging(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, [user, schoolId, isReady]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'loaded':
        return <Badge className="bg-green-100 text-green-800">✓ Connected</Badge>;
      case 'loading':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Loading</Badge>;
      case 'error':
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-800">✗ Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const overallHealth = () => {
    const { authentication, schoolContext, database } = debugInfo;
    if (authentication.status === 'connected' && 
        schoolContext.status === 'connected' && 
        database.status === 'connected') {
      return 'healthy';
    } else if (authentication.status === 'error' || 
               schoolContext.status === 'error' || 
               database.status === 'error') {
      return 'error';
    }
    return 'warning';
  };

  const health = overallHealth();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {health === 'healthy' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : health === 'error' ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-yellow-600" />
              )}
              Principal Dashboard Debug Info
            </CardTitle>
            <Button 
              onClick={runDiagnostics} 
              disabled={isDebugging}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isDebugging ? 'animate-spin' : ''}`} />
              {isDebugging ? 'Running...' : 'Run Diagnostics'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Authentication</h4>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                {getStatusBadge(debugInfo.authentication.status)}
              </div>
              {debugInfo.authentication.userId && (
                <>
                  <div className="text-sm text-muted-foreground">
                    User ID: {debugInfo.authentication.userId}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Role: {debugInfo.authentication.userRole}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Email: {debugInfo.authentication.userEmail}
                  </div>
                </>
              )}
            </div>

            {/* School Context */}
            <div className="space-y-2">
              <h4 className="font-semibold">School Context</h4>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                {getStatusBadge(debugInfo.schoolContext.status)}
              </div>
              {debugInfo.schoolContext.schoolId && (
                <div className="text-sm text-muted-foreground">
                  School ID: {debugInfo.schoolContext.schoolId}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Ready: {debugInfo.schoolContext.isReady ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="space-y-2">
            <h4 className="font-semibold">Database Connection</h4>
            <div className="flex items-center justify-between">
              <span>Status:</span>
              {getStatusBadge(debugInfo.database.status)}
            </div>
            {debugInfo.database.lastQuery && (
              <div className="text-sm text-muted-foreground">
                Last Query: {debugInfo.database.lastQuery.toLocaleString()}
              </div>
            )}
            {debugInfo.database.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Database Errors: {debugInfo.database.errors.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Component Status */}
          <div className="space-y-2">
            <h4 className="font-semibold">Component Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(debugInfo.components).map(([component, status]) => (
                <div key={component} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm capitalize">{component}:</span>
                  {getStatusBadge(status)}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Fixes */}
          {health !== 'healthy' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Troubleshooting Steps:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {debugInfo.authentication.status === 'error' && (
                    <li>Check authentication: Try logging out and back in</li>
                  )}
                  {debugInfo.schoolContext.status === 'error' && (
                    <li>School assignment missing: Contact administrator to assign school</li>
                  )}
                  {debugInfo.database.status === 'error' && (
                    <li>Database issue: Check network connection and try refreshing</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalDashboardDebugger;