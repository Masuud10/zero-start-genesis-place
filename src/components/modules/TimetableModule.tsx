
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SmartTimetableReview from '@/components/timetable/SmartTimetableReview';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TimetableModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState('Term 1 2025');
  const [generationKey, setGenerationKey] = useState(0);

  const handleGenerateTimetable = async () => {
    if (!user?.school_id) {
        toast({ title: "Error", description: "School information not found.", variant: "destructive" });
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-timetable', {
        body: {
          school_id: user.school_id,
          term: term,
        },
      });

      if (functionError) throw functionError;

      if (data.error) throw new Error(data.error);

      toast({
        title: 'Timetable Generation Started',
        description: `A new draft timetable for ${term} has been created with ${data.rowsCount} entries. You can now review it below.`,
      });
      setGenerationKey(k => k + 1);
    } catch (err: any) {
      console.error(err);
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
          <p className="text-muted-foreground">Manage class schedules and assignments</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Timetable Generation</CardTitle>
          <CardDescription>
            Generate, review, and publish school timetables using the AI-powered generator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
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
            <Button onClick={handleGenerateTimetable} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate New Draft'
              )}
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
