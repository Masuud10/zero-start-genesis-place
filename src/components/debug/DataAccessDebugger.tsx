
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataAccess } from '@/hooks/useDataAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Database } from 'lucide-react';

const DataAccessDebugger = () => {
  const { user } = useAuth();

  // Test access to key tables
  const tables = [
    { name: 'profiles', select: 'id, name, role, school_id' },
    { name: 'schools', select: 'id, name' },
    { name: 'students', select: 'id, name, school_id' },
    { name: 'classes', select: 'id, name, school_id' },
    { name: 'subjects', select: 'id, name, school_id' },
    { name: 'grades', select: 'id, student_id, school_id' },
    { name: 'attendance', select: 'id, student_id, school_id' }
  ];

  const testResults = tables.map(({ name, select }) => {
    const { data, error, isLoading } = useDataAccess({
      table: name,
      select,
      enabled: !!user
    });

    return {
      table: name,
      data,
      error,
      isLoading,
      hasAccess: !error && data !== undefined,
      recordCount: Array.isArray(data) ? data.length : 0
    };
  });

  if (!user) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>No authenticated user found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Access Debugger
          </CardTitle>
          <CardDescription>
            Testing RLS policies and data access for user: {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">User ID:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{user.id}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Role:</span>
              <Badge variant="outline">{user.role}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">School ID:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {user.school_id || 'Not assigned'}
              </code>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testResults.map(({ table, hasAccess, recordCount, error, isLoading }) => (
              <div
                key={table}
                className={`p-3 border rounded-lg ${
                  hasAccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    ) : hasAccess ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium capitalize">{table}</span>
                  </div>
                  {hasAccess && (
                    <Badge variant="secondary" className="text-xs">
                      {recordCount} records
                    </Badge>
                  )}
                </div>
                
                {error && (
                  <div className="mt-2 text-xs text-red-600">
                    {error.message || 'Access denied'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataAccessDebugger;
