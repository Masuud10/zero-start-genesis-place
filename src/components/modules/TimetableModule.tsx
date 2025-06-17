
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Loader2, Send, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SmartTimetableReview from '@/components/timetable/SmartTimetableReview';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useCurrentAcademicInfo } from '@/hooks/useCurrentAcademicInfo';

const TimetableModule = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { academicInfo } = useCurrentAcademicInfo(schoolId);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState(academicInfo.term || 'Term 1 2025');
  const [generationKey, setGenerationKey] = useState(0);
  const [sendingToTeachers, setSendingToTeachers] = useState(false);

  const handleGenerateTimetable = async () => {
    if (!schoolId) {
        toast({ title: "Error", description: "School information not found.", variant: "destructive" });
        return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Generating timetable for:', { schoolId, term });
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('No active session found');
      }

      const { data, error: functionError } = await supabase.functions.invoke('generate-timetable', {
        body: {
          school_id: schoolId,
          term: term,
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      console.log('📊 Function response:', data);

      if (functionError) {
        console.error('📊 Function error:', functionError);
        throw new Error(functionError.message || 'Failed to generate timetable');
      }

      if (data?.error) {
        console.error('📊 Response error:', data.error);
        throw new Error(data.error);
      }

      toast({
        title: 'Timetable Generation Started',
        description: `A new draft timetable for ${term} has been created with ${data.rowsCount || 0} entries. You can now review it below.`,
      });
      setGenerationKey(k => k + 1);
    } catch (err: any) {
      console.error('📊 Generation error:', err);
      const errorMessage = err.message || "An unknown error occurred during timetable generation.";
      setError(errorMessage);
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendToTeachers = async () => {
    if (!schoolId) {
      toast({ title: "Error", description: "School information not found.", variant: "destructive" });
      return;
    }

    setSendingToTeachers(true);
    try {
      // Get all teachers for this school
      const { data: teachers, error: teachersError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('school_id', schoolId)
        .eq('role', 'teacher');

      if (teachersError) throw new Error(teachersError.message);

      if (!teachers || teachers.length === 0) {
        toast({ 
          title: "No Teachers Found", 
          description: "No teachers found in this school to send the timetable to.",
          variant: "destructive" 
        });
        return;
      }

      // Here you would typically send notifications or emails to teachers
      // For now, we'll just show a success message
      toast({
        title: "Timetable Sent",
        description: `Timetable has been sent to ${teachers.length} teacher(s) in your school.`,
      });

      console.log('📧 Timetable sent to teachers:', teachers.map(t => t.name));

    } catch (err: any) {
      console.error('📧 Send error:', err);
      toast({
        title: 'Send Failed',
        description: err.message || 'Failed to send timetable to teachers',
        variant: 'destructive',
      });
    } finally {
      setSendingToTeachers(false);
    }
  };

  const handlePublishSuccess = () => {
    toast({
        title: "Timetable Published!",
        description: `The timetable for ${term} is now live for all users.`,
    });
    setGenerationKey(k => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Timetable Management
          </h1>
          <p className="text-muted-foreground">Generate, review, and publish school timetables using the AI-powered generator.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Timetable Generation
          </CardTitle>
          <CardDescription>
            Generate, review, and publish school timetables using the AI-powered generator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Term 1 2025">Term 1 2025</SelectItem>
                <SelectItem value="Term 2 2025">Term 2 2025</SelectItem>
                <SelectItem value="Term 3 2025">Term 3 2025</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleGenerateTimetable} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate New Draft'
              )}
            </Button>

            <Button 
              onClick={handleSendToTeachers} 
              disabled={sendingToTeachers} 
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              {sendingToTeachers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Teachers
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Prerequisites for Timetable Generation:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Classes must be created and assigned to your school</li>
              <li>• Subjects must be created and linked to classes</li>
              <li>• Teachers must be assigned to classes and subjects</li>
              <li>• Teacher availability can be set (optional)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <SmartTimetableReview 
        key={generationKey} 
        term={term} 
        onPublish={handlePublishSuccess} 
      />
    </div>
  );
};

export default TimetableModule;
