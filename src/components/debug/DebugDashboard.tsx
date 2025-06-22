
import React from 'react';
import { useAuthValidation } from '@/hooks/useAuthValidation';
import { useRLSDebugger } from '@/hooks/useRLSDebugger';
import DataAccessDebugger from './DataAccessDebugger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Bug, Shield, Database, User } from 'lucide-react';
import LoadingScreen from '@/components/common/LoadingScreen';

const DebugDashboard = () => {
  const authValidation = useAuthValidation();
  const { data: rlsResults, isLoading: rlsLoading } = useRLSDebugger();

  if (authValidation.isLoading || rlsLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bug className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Debug Dashboard</h1>
        <Badge variant="outline">Development Mode</Badge>
      </div>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 border rounded-lg ${authValidation.isAuthenticated ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="text-sm font-medium">Authenticated</div>
              <div className="text-xs text-gray-600">
                {authValidation.isAuthenticated ? 'Yes' : 'No'}
              </div>
            </div>
            <div className={`p-3 border rounded-lg ${authValidation.hasValidRole ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="text-sm font-medium">Valid Role</div>
              <div className="text-xs text-gray-600">
                {authValidation.user?.role || 'None'}
              </div>
            </div>
            <div className={`p-3 border rounded-lg ${authValidation.hasSchoolAssignment ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="text-sm font-medium">School Assignment</div>
              <div className="text-xs text-gray-600">
                {authValidation.user?.school_id ? 'Assigned' : 'Not assigned'}
              </div>
            </div>
            <div className={`p-3 border rounded-lg ${authValidation.canAccessData ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="text-sm font-medium">Data Access</div>
              <div className="text-xs text-gray-600">
                {authValidation.canAccessData ? 'Enabled' : 'Blocked'}
              </div>
            </div>
          </div>

          {authValidation.errors.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                <div className="font-medium">Issues found:</div>
                <ul className="list-disc list-inside mt-1">
                  {authValidation.errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* RLS Permissions */}
      {rlsResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              RLS Permissions Test
            </CardTitle>
            <CardDescription>
              Testing Row Level Security policies for current user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(rlsResults.permissions).map(([table, permission]: [string, any]) => (
                <div key={table} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{table}</div>
                    {permission.error && (
                      <div className="text-xs text-red-600 mt-1">{permission.error}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {permission.count !== undefined && (
                      <Badge variant="secondary">{permission.count} records</Badge>
                    )}
                    <Badge variant={permission.canRead ? 'default' : 'destructive'}>
                      {permission.canRead ? 'Accessible' : 'Blocked'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {rlsResults.errors.length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  <div className="font-medium">RLS Errors:</div>
                  <ul className="list-disc list-inside mt-1">
                    {rlsResults.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Access Debugger */}
      <DataAccessDebugger />
    </div>
  );
};

export default DebugDashboard;
