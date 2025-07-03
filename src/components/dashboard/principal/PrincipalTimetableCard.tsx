
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Download, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PrincipalTimetableCard: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const { data: timetables, isLoading, refetch } = useQuery({
    queryKey: ['principal-timetables', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('timetables')
        .select(`
          id,
          day_of_week,
          start_time,
          end_time,
          room,
          is_published,
          created_at,
          classes!inner(id, name),
          subjects!inner(id, name),
          profiles!timetables_teacher_id_fkey(id, name)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId
  });

  const handleGenerateTimetable = async () => {
    if (!schoolId || !user?.id) return;

    setGenerating(true);
    try {
      // Call the generate_timetable function
      const { data, error } = await supabase.rpc('generate_timetable', {
        p_school_id: schoolId,
        p_class_id: null, // Generate for all classes
        p_created_by: user.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Timetable generated successfully!",
      });

      await refetch();
    } catch (error: any) {
      console.error('Error generating timetable:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate timetable.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadTimetable = () => {
    toast({
      title: "Download",
      description: "Timetable download functionality will be implemented soon.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timetable Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading timetables...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Calendar className="h-5 w-5" />
            Timetable Management
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleGenerateTimetable}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Generate Timetable
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!timetables || timetables.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No timetables found</h3>
            <p className="text-gray-600 mb-4">
              Generate timetables for your school classes to get started.
            </p>
            <Button
              onClick={handleGenerateTimetable}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Generate First Timetable
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Recent Timetables</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadTimetable}
              >
                <Download className="h-4 w-4 mr-1" />
                Download All
              </Button>
            </div>
            
            <div className="space-y-3">
              {timetables.slice(0, 5).map((timetable) => (
                <div
                  key={timetable.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {timetable.classes?.name} - {timetable.subjects?.name}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {timetable.day_of_week} • {timetable.start_time} - {timetable.end_time}
                        {timetable.room && ` • ${timetable.room}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={timetable.is_published ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {timetable.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {timetables.length > 5 && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  View All Timetables ({timetables.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrincipalTimetableCard;
