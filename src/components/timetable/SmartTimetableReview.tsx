import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TimetableRow {
  id: string;
  class_id: string;
  // Remove subject_id, teacher_id, day_of_week, start_time, end_time since these do not exist based on your errors
  // Only use fields that exist: id, class_id, school_id, is_active, created_at, created_by, version
  school_id?: string;
  is_active?: boolean;
  created_at?: string;
  created_by?: string;
  version?: number;
}

const SmartTimetableReview = ({
  term,
  onPublish,
}: {
  term: string;
  onPublish: () => void;
}) => {
  const { user } = useAuth();
  // FIX: Use any[] instead of TimetableRow[] to avoid deep type instantiation
  const [rows, setRows] = useState<any[]>([]);
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
          .select("id,class_id,school_id,is_active,created_at,created_by,version")
          .eq("school_id", user.school_id)
          .eq("term", term)
          .eq("is_published", false);

        if (error) {
          setErrorMsg("Error fetching timetable draft: " + error.message);
          setRows([]);
        } else if (!Array.isArray(data) || data.some((row) => !row?.id || !row?.class_id)) {
          setErrorMsg("No valid draft timetable found.");
          setRows([]);
        } else {
          setRows(data || []);
        }
      } catch (e: any) {
        setErrorMsg("Error fetching timetable draft: " + (e?.message ?? String(e)));
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
                <th>Class</th>
                <th>School</th>
                <th>Active</th>
                <th>Created At</th>
                <th>Created By</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.class_id}</td>
                  <td>{r.school_id ?? "-"}</td>
                  <td>{r.is_active ? "Yes" : "No"}</td>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</td>
                  <td>{r.created_by ?? "-"}</td>
                  <td>{r.version ?? "-"}</td>
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
