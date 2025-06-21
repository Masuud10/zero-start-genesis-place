
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TeacherGradesManager from '@/components/dashboard/teacher/TeacherGradesManager';
import { GraduationCap } from 'lucide-react';

const TeacherGradesModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            My Class Grades
          </h1>
          <p className="text-muted-foreground mt-1">
            Enter and manage grades for your assigned classes and subjects.
          </p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <TeacherGradesManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherGradesModule;
