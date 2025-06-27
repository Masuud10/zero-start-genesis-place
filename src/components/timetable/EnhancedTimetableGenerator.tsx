
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, Settings, Play, CheckCircle } from 'lucide-react';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TimetableGenerationResult {
  success?: boolean;
  error?: string;
  message?: string;
}

const EnhancedTimetableGenerator: React.FC = () => {
  const { schoolId } = useSchoolScopedData();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');

  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      if (!schoolId) return;
      
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', schoolId)
          .order('name');
          
        if (error) throw error;
        setClasses(data || []);
      } catch (error: any) {
        console.error('Error loading classes:', error);
        toast({
          title: "Error",
          description: "Failed to load classes.",
          variant: "destructive"
        });
      }
    };
    loadClasses();
  }, [schoolId, toast]);

  // Load subjects for selected class
  useEffect(() => {
    const loadSubjects = async () => {
      if (!selectedClass || !schoolId) {
        setSubjects([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subjects')
          .select(`
            id,
            name,
            code,
            teacher_id,
            profiles!subjects_teacher_id_fkey(name)
          `)
          .eq('class_id', selectedClass)
          .eq('school_id', schoolId)
          .order('name');

        if (error) throw error;
        setSubjects(data || []);
      } catch (error: any) {
        console.error('Error loading subjects:', error);
        toast({
          title: "Error",
          description: "Failed to load subjects.",
          variant: "destructive"
        });
      }
    };
    loadSubjects();
  }, [selectedClass, schoolId, toast]);

  const generateTimetable = async () => {
    if (!selectedClass || !user?.id || !schoolId) {
      toast({
        title: "Missing Information",
        description: "Please select a class and ensure you're logged in.",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    setProgress(0);
    setGenerationStep('Preparing generation...');

    try {
      // Step 1: Validate subjects
      setProgress(20);
      setGenerationStep('Validating subjects...');
      
      if (subjects.length === 0) {
        throw new Error('No subjects found for the selected class');
      }

      // Step 2: Clear existing timetable
      setProgress(40);
      setGenerationStep('Clearing existing timetable...');
      
      const { error: deleteError } = await supabase
        .from('timetables')
        .delete()
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId);

      if (deleteError) throw deleteError;

      // Step 3: Generate new timetable
      setProgress(60);
      setGenerationStep('Generating new timetable...');

      const { data: result, error } = await supabase.rpc('generate_timetable', {
        p_school_id: schoolId,
        p_class_id: selectedClass,
        p_created_by: user.id
      });

      if (error) throw error;

      // Type-safe check for the result
      const generationResult = result as TimetableGenerationResult;
      
      if (generationResult && typeof generationResult === 'object' && 'error' in generationResult) {
        throw new Error(generationResult.error);
      }

      // Step 4: Complete
      setProgress(100);
      setGenerationStep('Timetable generated successfully!');

      toast({
        title: "Success",
        description: "Timetable has been generated successfully.",
      });

      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
        setGenerationStep('');
      }, 2000);

    } catch (error: any) {
      console.error('Timetable generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate timetable.",
        variant: "destructive"
      });
      setGenerating(false);
      setProgress(0);
      setGenerationStep('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Timetable Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="class">Select Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.stream && `(${cls.stream})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClass && subjects.length > 0 && (
            <div className="space-y-2">
              <Label>Subjects for Selected Class</Label>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <Badge key={subject.id} variant="secondary">
                    {subject.name} - {subject.profiles?.name || 'No Teacher'}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                {subjects.length} subject{subjects.length !== 1 ? 's' : ''} found
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {generating && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="font-medium">Generating Timetable...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600">{generationStep}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Generation Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm">5 Days per Week</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm">8 Periods per Day</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Auto Teacher Assignment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Conflict Detection</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={generateTimetable}
          disabled={!selectedClass || subjects.length === 0 || generating}
          className="min-w-[200px]"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Generate Timetable
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedTimetableGenerator;
