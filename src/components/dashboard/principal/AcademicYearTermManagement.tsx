
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AcademicYearModal from '@/components/modals/AcademicYearModal';
import AcademicTermModal from '@/components/modals/AcademicTermModal';

const AcademicYearTermManagement = () => {
  const { schoolId } = useSchoolScopedData();
  const [showYearModal, setShowYearModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);

  const { data: academicYears, refetch: refetchYears } = useQuery({
    queryKey: ['academicYears', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase.from('academic_years').select('*').eq('school_id', schoolId!).order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!schoolId,
  });

  const { data: academicTerms, refetch: refetchTerms } = useQuery({
    queryKey: ['academicTerms', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase.from('academic_terms').select('*, academic_years(year_name)').eq('school_id', schoolId!).order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!schoolId,
  });

  const handleYearCreated = () => {
    refetchYears();
  };

  const handleTermCreated = () => {
    refetchTerms();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Years Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Academic Years
            </CardTitle>
            <CardDescription>Manage academic years for your school</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setShowYearModal(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Academic Year
            </Button>
            
            <div className="space-y-2">
              {academicYears && academicYears.length > 0 ? (
                academicYears.map((year) => (
                  <div key={year.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{year.year_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(year.start_date).toLocaleDateString()} - {new Date(year.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    {year.is_current && <Badge variant="default">Current</Badge>}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No academic years configured</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Academic Terms Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Academic Terms
            </CardTitle>
            <CardDescription>Manage academic terms for your school</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setShowTermModal(true)} className="w-full" disabled={!academicYears || academicYears.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Academic Term
            </Button>
            
            <div className="space-y-2">
              {academicTerms && academicTerms.length > 0 ? (
                academicTerms.map((term) => (
                  <div key={term.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{term.term_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">Year: {(term as any).academic_years?.year_name}</p>
                    </div>
                    {term.is_current && <Badge variant="default">Current</Badge>}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No academic terms configured</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AcademicYearModal
        open={showYearModal}
        onClose={() => setShowYearModal(false)}
        onYearCreated={handleYearCreated}
      />
      <AcademicTermModal
        open={showTermModal}
        onClose={() => setShowTermModal(false)}
        onTermCreated={handleTermCreated}
      />
    </div>
  );
};

export default AcademicYearTermManagement;
