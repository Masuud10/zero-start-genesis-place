
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AcademicYear {
  id: string;
  year_name: string;
  is_current: boolean;
}

interface AcademicTerm {
  id: string;
  term_name: string;
  is_current: boolean;
  academic_year_id: string;
}

const AcademicSettings = () => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedTermId, setSelectedTermId] = useState<string>('');

  const { data: years, isLoading: isLoadingYears } = useQuery({
    queryKey: ['academicYears', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase.from('academic_years').select('*').eq('school_id', schoolId!);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!schoolId,
  });

  const { data: terms, isLoading: isLoadingTerms } = useQuery({
    queryKey: ['academicTerms', schoolId, selectedYearId],
    queryFn: async () => {
      const { data, error } = await supabase.from('academic_terms').select('*').eq('school_id', schoolId!).eq('academic_year_id', selectedYearId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!schoolId && !!selectedYearId,
  });
  
  const currentYear = years?.find(y => y.is_current);
  const currentTerm = terms?.find(t => t.is_current);

  useEffect(() => {
    if (currentYear) setSelectedYearId(currentYear.id);
  }, [currentYear]);

  useEffect(() => {
    if (currentTerm) setSelectedTermId(currentTerm.id);
  }, [currentTerm]);
  
  const { mutate: setAcademicPeriod, isPending: isSaving } = useMutation({
    mutationFn: async ({ yearId, termId }: { yearId: string, termId: string }) => {
        // In a real app, you'd use a transaction here via a db function
        // For simplicity, we'll do it in two steps.
        
        // 1. Set all years/terms to not current
        await supabase.from('academic_years').update({ is_current: false }).eq('school_id', schoolId!);
        await supabase.from('academic_terms').update({ is_current: false }).eq('school_id', schoolId!);

        // 2. Set the selected year/term to current
        const { error: yearError } = await supabase.from('academic_years').update({ is_current: true }).eq('id', yearId);
        if (yearError) throw new Error(`Failed to set academic year: ${yearError.message}`);

        const { error: termError } = await supabase.from('academic_terms').update({ is_current: true }).eq('id', termId);
        if (termError) throw new Error(`Failed to set academic term: ${termError.message}`);
    },
    onSuccess: () => {
        toast({ title: "Success", description: "Academic period has been updated." });
        queryClient.invalidateQueries({ queryKey: ['academicYears', schoolId] });
        queryClient.invalidateQueries({ queryKey: ['academicTerms', schoolId] });
        queryClient.invalidateQueries({ queryKey: ['currentAcademicInfo', schoolId] });
    },
    onError: (error) => {
        toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  const handleSave = () => {
    if (!selectedYearId || !selectedTermId) {
        toast({ title: "Selection Missing", description: "Please select both an academic year and a term.", variant: "destructive" });
        return;
    }
    setAcademicPeriod({ yearId: selectedYearId, termId: selectedTermId });
  };
  
  const isLoading = isLoadingYears || isLoadingTerms;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Period Settings</CardTitle>
        <CardDescription>Set the current academic year and term for the entire school. This affects reporting, grading, and attendance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
            <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading settings...</div>
        ) : years && years.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Academic Year</label>
              <Select value={selectedYearId} onValueChange={setSelectedYearId}>
                <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                <SelectContent>
                  {years.map((year: AcademicYear) => <SelectItem key={year.id} value={year.id}>{year.year_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Term</label>
              <Select value={selectedTermId} onValueChange={setSelectedTermId} disabled={!selectedYearId || isLoadingTerms}>
                <SelectTrigger><SelectValue placeholder="Select Term" /></SelectTrigger>
                <SelectContent>
                  {terms?.map((term: AcademicTerm) => <SelectItem key={term.id} value={term.id}>{term.term_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Set as Current'}
            </Button>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
                No academic years or terms have been configured for this school. Please add them in the management section first.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AcademicSettings;
