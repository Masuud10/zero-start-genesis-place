
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useTeacherTimetable } from '@/hooks/useTeacherTimetable';
import { Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EnhancedTimetableGenerator from '../timetable/EnhancedTimetableGenerator';
import TeacherTimetableView from '../timetable/TeacherTimetableView';

const TimetableModule = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { data: teacherTimetable, isLoading, error } = useTeacherTimetable();

  // Only principals can generate/modify timetables
  const canManageTimetable = user?.role === 'principal';

  if (user?.role === 'teacher') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Timetable
            </h1>
            <p className="text-muted-foreground">
              View your teaching schedule
            </p>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading timetable...</div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <Alert variant="destructive">
                <AlertDescription>Failed to load timetable</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : !teacherTimetable || teacherTimetable.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Timetable Available</h3>
                <p>Your timetable has not been generated yet. Please contact the principal.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <TeacherTimetableView timetable={teacherTimetable} />
        )}
      </div>
    );
  }

  if (!canManageTimetable) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                Timetable management is only available to principals.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EnhancedTimetableGenerator />
    </div>
  );
};

export default TimetableModule;
