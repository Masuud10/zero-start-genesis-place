
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Users, BookOpen, User } from "lucide-react";

// Interface for timetable entries with related data
interface TimetableEntry {
  id: string;
  class_id: string;
  school_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_published: boolean;
  created_at: string;
  created_by_principal_id: string;
  term: string | null;
  room?: string;
  classes?: { id: string; name: string };
  subjects?: { id: string; name: string };
  profiles?: { id: string; name: string };
}

const SmartTimetableReview = ({
  term,
  onPublish,
}: {
  term: string;
  onPublish: () => void;
}) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.school_id) return;
    fetchTimetableData();
  }, [user?.school_id, term]);

  const fetchTimetableData = async () => {
    if (!user?.school_id) return;
    
    setLoading(true);
    setErrorMsg(null);

    try {
      console.log('📊 Fetching timetable data for:', { schoolId: user.school_id, term });
      
      const { data, error } = await supabase
        .from("timetables")
        .select(`
          *,
          classes!timetables_class_id_fkey(id, name),
          subjects!timetables_subject_id_fkey(id, name),
          profiles!timetables_teacher_id_fkey(id, name)
        `)
        .eq("school_id", user.school_id)
        .eq("term", term)
        .eq("is_published", false)
        .order('day_of_week')
        .order('start_time');

      console.log('📊 Timetable data received:', data);

      if (error) {
        console.error("📊 Supabase error:", error);
        setErrorMsg("Error fetching timetable draft: " + error.message);
        setEntries([]);
      } else if (!data || data.length === 0) {
        setErrorMsg("No draft timetable found. Generate a new timetable to get started.");
        setEntries([]);
      } else {
        setEntries(data as TimetableEntry[]);
        setErrorMsg(null);
      }
    } catch (err: any) {
      console.error("📊 Fetch error:", err);
      setErrorMsg("Error fetching timetable draft: " + err.message);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!user?.school_id) {
      toast({
        title: "Publish Failed",
        description: "User is not associated with a school.",
        variant: "destructive",
      });
      return;
    }
    
    setPublishLoading(true);
    try {
      console.log('📊 Publishing timetable for:', { schoolId: user.school_id, term });
      
      const { error } = await supabase
        .from("timetables")
        .update({ is_published: true })
        .eq("school_id", user.school_id)
        .eq("term", term)
        .eq("is_published", false);
      
      if (error) {
        console.error('📊 Publish error:', error);
        throw new Error(error.message);
      }
      
      toast({
        title: "Published Successfully",
        description: "Timetable published to all users",
        variant: "default",
      });
      
      if (onPublish) onPublish();
      await fetchTimetableData(); // Refresh data
    } catch (err: any) {
      console.error('📊 Publish error:', err);
      toast({
        title: "Publish Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setPublishLoading(false);
    }
  };

  // Group entries by day and time for better display
  const groupedEntries = entries.reduce((acc, entry) => {
    const key = `${entry.day_of_week}-${entry.start_time}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(entry);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  // Get unique statistics
  const stats = {
    totalClasses: new Set(entries.map(e => e.class_id)).size,
    totalSubjects: new Set(entries.map(e => e.subject_id)).size,
    totalTeachers: new Set(entries.map(e => e.teacher_id)).size,
    totalSlots: entries.length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          AI-Generated Timetable Review ({term})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : errorMsg ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">{errorMsg}</div>
            <Button onClick={fetchTimetableData} variant="outline">
              Refresh
            </Button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No timetable drafts found. Generate a new timetable to get started.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Classes</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">{stats.totalClasses}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Subjects</span>
                </div>
                <div className="text-2xl font-bold text-green-800">{stats.totalSubjects}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <User className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Teachers</span>
                </div>
                <div className="text-2xl font-bold text-purple-800">{stats.totalTeachers}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">Total Slots</span>
                </div>
                <div className="text-2xl font-bold text-orange-800">{stats.totalSlots}</div>
              </div>
            </div>

            {/* Timetable Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="font-medium text-gray-900">Timetable Preview</h4>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <Badge variant="outline">{entry.day_of_week}</Badge>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                        </td>
                        <td className="px-4 py-2 font-medium">
                          {entry.classes?.name || 'Unknown Class'}
                        </td>
                        <td className="px-4 py-2">
                          {entry.subjects?.name || 'Unknown Subject'}
                        </td>
                        <td className="px-4 py-2">
                          {entry.profiles?.name || 'Unknown Teacher'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handlePublish}
                disabled={publishLoading || !entries.length}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {publishLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish Timetable
                  </>
                )}
              </Button>
              
              <Button onClick={fetchTimetableData} variant="outline">
                Refresh
              </Button>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <strong>Note:</strong> After publishing, the timetable will be visible to all teachers, students, and parents. 
              You can generate a new draft at any time to make changes.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartTimetableReview;
