
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, BookOpen, Settings, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AcademicSettings = () => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  // Fetch academic years
  const { data: academicYears } = useQuery({
    queryKey: ['academicYears', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', schoolId!)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!schoolId,
  });

  // Fetch academic terms
  const { data: academicTerms } = useQuery({
    queryKey: ['academicTerms', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_terms')
        .select('*, academic_years(year_name)')
        .eq('school_id', schoolId!)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!schoolId,
  });

  // Get current academic year and term
  const currentYear = academicYears?.find(year => year.is_current);
  const currentTerm = academicTerms?.find(term => term.is_current);

  // Mutation to set current academic year
  const { mutate: setCurrentYear, isPending: settingYear } = useMutation({
    mutationFn: async (yearId: string) => {
      // First, unset all current years
      await supabase
        .from('academic_years')
        .update({ is_current: false })
        .eq('school_id', schoolId!);
      
      // Then set the selected year as current
      const { error } = await supabase
        .from('academic_years')
        .update({ is_current: true })
        .eq('id', yearId)
        .eq('school_id', schoolId!);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Current academic year updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['academicYears', schoolId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  // Mutation to set current academic term
  const { mutate: setCurrentTerm, isPending: settingTerm } = useMutation({
    mutationFn: async (termId: string) => {
      // First, unset all current terms
      await supabase
        .from('academic_terms')
        .update({ is_current: false })
        .eq('school_id', schoolId!);
      
      // Then set the selected term as current
      const { error } = await supabase
        .from('academic_terms')
        .update({ is_current: true })
        .eq('id', termId)
        .eq('school_id', schoolId!);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Current academic term updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['academicTerms', schoolId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  const handleSetCurrentYear = () => {
    if (selectedYear) {
      setCurrentYear(selectedYear);
    }
  };

  const handleSetCurrentTerm = () => {
    if (selectedTerm) {
      setCurrentTerm(selectedTerm);
    }
  };

  if (!academicYears || academicYears.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No academic years have been configured for this school. Please add them in the Academic Periods tab first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Academic Period Settings</h2>
          <p className="text-gray-600">Set the current academic year and term for the entire school.</p>
        </div>
      </div>

      {/* Current Settings Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Calendar className="h-5 w-5" />
              Current Academic Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentYear ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-600">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                  <span className="font-semibold text-lg">{currentYear.year_name}</span>
                </div>
                <p className="text-sm text-green-600">
                  {new Date(currentYear.start_date).toLocaleDateString()} - {new Date(currentYear.end_date).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No current academic year set</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <BookOpen className="h-5 w-5" />
              Current Academic Term
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentTerm ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-blue-600">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                  <span className="font-semibold text-lg">{currentTerm.term_name}</span>
                </div>
                <p className="text-sm text-blue-600">
                  {new Date(currentTerm.start_date).toLocaleDateString()} - {new Date(currentTerm.end_date).toLocaleDateString()}
                </p>
                <p className="text-xs text-blue-500">
                  Year: {(currentTerm as any).academic_years?.year_name}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No current academic term set</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settings Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Set Current Academic Year */}
        <Card>
          <CardHeader>
            <CardTitle>Update Current Academic Year</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="year-select">Select Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears?.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      <div className="flex items-center gap-2">
                        {year.is_current && <Check className="h-4 w-4 text-green-600" />}
                        <span>{year.year_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSetCurrentYear} 
              disabled={!selectedYear || settingYear}
              className="w-full"
            >
              {settingYear ? 'Setting...' : 'Set as Current Year'}
            </Button>
          </CardContent>
        </Card>

        {/* Set Current Academic Term */}
        <Card>
          <CardHeader>
            <CardTitle>Update Current Academic Term</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="term-select">Select Academic Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose academic term" />
                </SelectTrigger>
                <SelectContent>
                  {academicTerms?.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      <div className="flex items-center gap-2">
                        {term.is_current && <Check className="h-4 w-4 text-green-600" />}
                        <span>{term.term_name}</span>
                        <span className="text-xs text-gray-500">
                          ({(term as any).academic_years?.year_name})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSetCurrentTerm} 
              disabled={!selectedTerm || settingTerm || !academicTerms || academicTerms.length === 0}
              className="w-full"
            >
              {settingTerm ? 'Setting...' : 'Set as Current Term'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcademicSettings;
