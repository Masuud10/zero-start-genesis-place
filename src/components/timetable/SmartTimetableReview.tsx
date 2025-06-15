
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// This interface now matches the full 'timetables' table schema
interface TimetableRow {
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
}

const SmartTimetableReview = ({
  term,
  onPublish,
}: {
  term: string;
  onPublish: () => void;
}) => {
  const { user } = useAuth();
  // State holds a summary: one row per class from the draft.
  const [rows, setRows] = useState<TimetableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.school_id) return;
    setLoading(true);
    setErrorMsg(null);

    (async () => {
      try {
        const { data, error } = await supabase
          .from("timetables")
          .select("*") // Fetch all fields to align with the new schema
          .eq("school_id", user.school_id)
          .eq("term", term)
          .eq("is_published", false);

        if (error) {
          console.error("Supabase error:", error);
          setErrorMsg("Error fetching timetable draft: " + error.message);
          setRows([]);
        } else if (!data || data.length === 0) {
          setErrorMsg("No valid draft timetable found.");
          setRows([]);
        } else {
          // Process data to show one summary row per class_id.
          const classSummary = Array.from(
            new Map(data.map((item) => [item.class_id, item])).values()
          );
          setRows(classSummary);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setErrorMsg("Error fetching timetable draft: " + err.message);
        setRows([]);
      }
      setLoading(false);
    })();
  }, [user?.school_id, term]);

  const handlePublish = async () => {
    if (!user?.school_id) {
      toast({
        title: "Publish Failed",
        description: "User is not associated with a school.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("timetables")
        .update({ is_published: true })
        .eq("school_id", user.school_id)
        .eq("term", term)
        .eq("is_published", false);
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Published",
        description: "Timetable published to all users",
        variant: "default",
      });
      if (onPublish) onPublish();
    } catch (err: any) {
      toast({
        title: "Publish Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6">
      <div className="font-bold text-lg mb-2">
        AI-Generated Timetable (Draft)
      </div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : errorMsg ? (
        <div className="text-red-500">{errorMsg}</div>
      ) : rows.length === 0 ? (
        <div className="text-gray-500">No timetable drafts found.</div>
      ) : (
        <div>
          <table className="border w-full mb-4">
            <thead>
              <tr>
                <th className="border px-2 py-1">Class</th>
                <th className="border px-2 py-1">School</th>
                <th className="border px-2 py-1">Published</th>
                <th className="border px-2 py-1">Created At</th>
                <th className="border px-2 py-1">Created By</th>
                <th className="border px-2 py-1">Term</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="border px-2 py-1">{r.class_id}</td>
                  <td className="border px-2 py-1">{r.school_id ?? "-"}</td>
                  <td className="border px-2 py-1">{r.is_published ? "Yes" : "No"}</td>
                  <td className="border px-2 py-1">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="border px-2 py-1">{r.created_by_principal_id ?? "-"}</td>
                  <td className="border px-2 py-1">{r.term ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button
            onClick={handlePublish}
            disabled={loading || !rows.length}
            className="bg-green-600 text-white"
          >
            {loading ? "Publishing..." : "Publish Timetable"}
          </Button>
        </div>
      )}
      <div className="text-xs text-gray-500 mt-2">
        After publishing, timetable will be visible to all teachers, students & parents.
      </div>
    </div>
  );
};

export default SmartTimetableReview;
