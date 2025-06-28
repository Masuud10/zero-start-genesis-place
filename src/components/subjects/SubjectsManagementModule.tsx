
import React, { useState } from 'react';
import { useSubjects } from '@/hooks/useSubjects';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, GraduationCap, Users } from 'lucide-react';
import SubjectLoadingFallback from './SubjectLoadingFallback';

const SubjectsManagementModule: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const { schoolId } = useSchoolScopedData();
  
  const { 
    subjects, 
    loading, 
    error, 
    retry 
  } = useSubjects(selectedClassId === 'all' ? undefined : selectedClassId);

  const handleRetry = () => {
    console.log('🔄 SubjectsManagementModule: Retrying subjects fetch');
    retry();
  };

  // Show loading/error fallback if needed
  if (loading || error) {
    return (
      <SubjectLoadingFallback
        isLoading={loading}
        error={error}
        onRetry={handleRetry}
        title="Subjects Management"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Subjects Management
          </h2>
          <p className="text-muted-foreground">
            Manage subjects and their assignments for your school
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {/* Add class options here */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Display */}
      {subjects.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Subjects Found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedClassId === 'all' 
                  ? "No subjects have been created for this school yet."
                  : "No subjects found for the selected class."}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Subject
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {subject.code}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subject.class_id && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Class ID: {subject.class_id}</span>
                    </div>
                  )}
                  {subject.teacher_id && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Teacher ID: {subject.teacher_id}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Curriculum: {subject.curriculum || 'CBC'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Category: {subject.category || 'Core'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectsManagementModule;
