
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useCurrentAcademicInfo } from '@/hooks/useCurrentAcademicInfo';
import { useTeacherTimetable } from '@/hooks/useTeacherTimetable';
import { Calendar, Clock, Users, BookOpen, MapPin, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TimetableModule = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { academicInfo } = useCurrentAcademicInfo(schoolId);
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
              View your teaching schedule for {academicInfo.term || 'current term'}
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
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Timetable Management
          </h1>
          <p className="text-muted-foreground">
            Generate and manage school timetables for {academicInfo.term || 'current term'}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Calendar className="h-4 w-4 mr-2" />
          Generate New Timetable
        </Button>
      </div>

      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          As a principal, you have full access to create, modify, and publish timetables for all classes and teachers.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Timetable Management Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
              <Calendar className="h-8 w-8 mb-2" />
              <span>Create Timetable</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
              <Users className="h-8 w-8 mb-2" />
              <span>Assign Teachers</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
              <BookOpen className="h-8 w-8 mb-2" />
              <span>Manage Subjects</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Component for displaying teacher's timetable
const TeacherTimetableView = ({ timetable }: { timetable: any[] }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {daysOfWeek.map(day => {
        const daySchedule = timetable
          .filter(entry => entry.day_of_week === day)
          .sort((a, b) => a.start_time.localeCompare(b.start_time));

        return (
          <Card key={day}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {daySchedule.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No classes
                </div>
              ) : (
                daySchedule.map((entry) => (
                  <div key={entry.id} className="p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {entry.start_time} - {entry.end_time}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {entry.subject.name}
                      </Badge>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {entry.class.name}
                      </div>
                      {entry.room && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Room {entry.room}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TimetableModule;
