
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Settings, CheckCircle } from 'lucide-react';
import AcademicYearModal from '@/components/modals/AcademicYearModal';
import AcademicTermModal from '@/components/modals/AcademicTermModal';

const AcademicYearTermManagement = () => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showYearModal, setShowYearModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);

  // Fetch academic years with proper school isolation
  const { data: academicYears, isLoading: loadingYears } = useQuery({
    queryKey: ['academicYears', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', schoolId)
        .order('start_date', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Fetch academic terms with proper school isolation
  const { data: academicTerms, isLoading: loadingTerms } = useQuery({
    queryKey: ['academicTerms', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('academic_terms')
        .select('*, academic_years(year_name)')
        .eq('school_id', schoolId)
        .order('start_date', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Set current academic year
  const setCurrentYear = useMutation({
    mutationFn: async (yearId: string) => {
      if (!schoolId) throw new Error('No school ID');
      
      // First, unset all current years for this school
      await supabase
        .from('academic_years')
        .update({ is_current: false })
        .eq('school_id', schoolId);
      
      // Then set the selected year as current
      const { error } = await supabase
        .from('academic_years')
        .update({ is_current: true })
        .eq('id', yearId)
        .eq('school_id', schoolId);
      
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

  // Set current academic term
  const setCurrentTerm = useMutation({
    mutationFn: async (termId: string) => {
      if (!schoolId) throw new Error('No school ID');
      
      // First, unset all current terms for this school
      await supabase
        .from('academic_terms')
        .update({ is_current: false })
        .eq('school_id', schoolId);
      
      // Then set the selected term as current
      const { error } = await supabase
        .from('academic_terms')
        .update({ is_current: true })
        .eq('id', termId)
        .eq('school_id', schoolId);
      
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

  const handleEntityCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['academicYears', schoolId] });
    queryClient.invalidateQueries({ queryKey: ['academicTerms', schoolId] });
  };

  if (!schoolId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No school assignment found. Please contact your administrator.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Academic Years Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Academic Years
            </CardTitle>
            <Button onClick={() => setShowYearModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Year
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingYears ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {academicYears?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No academic years found. Create your first academic year to get started.
                </p>
              ) : (
                academicYears?.map((year) => (
                  <div key={year.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{year.year_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(year.start_date).toLocaleDateString()} - {new Date(year.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      {year.is_current && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      )}
                    </div>
                    {!year.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentYear.mutate(year.id)}
                        disabled={setCurrentYear.isPending}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Set as Current
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Terms Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Academic Terms
            </CardTitle>
            <Button 
              onClick={() => setShowTermModal(true)} 
              size="sm"
              disabled={!academicYears?.length}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Term
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTerms ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {academicTerms?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No academic terms found. Create your first academic term to get started.
                </p>
              ) : (
                academicTerms?.map((term) => (
                  <div key={term.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{term.term_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {term.academic_years?.year_name} • {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      {term.is_current && (
                        <Badge className="bg-purple-100 text-purple-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      )}
                    </div>
                    {!term.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentTerm.mutate(term.id)}
                        disabled={setCurrentTerm.isPending}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Set as Current
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AcademicYearModal
        open={showYearModal}
        onClose={() => setShowYearModal(false)}
        onYearCreated={handleEntityCreated}
      />
      <AcademicTermModal
        open={showTermModal}
        onClose={() => setShowTermModal(false)}
        onTermCreated={handleEntityCreated}
      />
    </div>
  );
};

export default AcademicYearTermManagement;
