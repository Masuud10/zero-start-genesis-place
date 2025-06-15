
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TimetableRow {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subjects?: { name?: string };
  profiles?: { name?: string };
}

const SmartTimetableReview = ({ term, onPublish }: { term: string; onPublish: () => void }) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<TimetableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.school_id) return;
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase
          .from("timetables")
          .select(`*, subjects(name), profiles:teacher_id(name)`)
          .eq("school_id", user.school_id)
          .eq("term", term)
          .eq("is_published", false);
        setRows(data || []);
      } catch (e) {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.school_id, term]);

  const handlePublish = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("timetables")
        .update({ is_published: true } as any)
        .eq("school_id", user.school_id)
        .eq("term", term)
        .eq("is_published", false);
      if (error) throw new Error(error.message);
      toast({ title: "Published", description: "Timetable published to all users", variant: "default" });
      if (onPublish) onPublish();
    } catch (err: any) {
      toast({ title: "Publish Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6">
      <div className="font-bold text-lg mb-2">AI-Generated Timetable (Draft)</div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <>
          <table className="border w-full mb-4">
            <thead>
              <tr>
                <th>Class</th>
                <th>Day</th>
                <th>Start</th>
                <th>End</th>
                <th>Subject</th>
                <th>Teacher</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.class_id}</td>
                  <td>{r.day_of_week}</td>
                  <td>{r.start_time}</td>
                  <td>{r.end_time}</td>
                  <td>{r.subjects?.name || r.subject_id}</td>
                  <td>{r.profiles?.name || r.teacher_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button onClick={handlePublish} disabled={loading || !rows.length} className="bg-green-600 text-white">
            {loading ? "Publishing..." : "Publish Timetable"}
          </Button>
        </>
      )}
      <div className="text-xs text-gray-500 mt-2">
        After publishing, timetable will be visible to all teachers, students & parents.
      </div>
    </div>
  );
};

export default SmartTimetableReview;
