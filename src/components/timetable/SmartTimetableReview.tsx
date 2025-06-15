
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TimetableRow {
  id: string;
  class_id: string;
  school_id: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
  version: number;
}

const SmartTimetableReview = ({
  term,
  onPublish,
}: {
  term: string;
  onPublish: () => void;
}) => {
  const { user } = useAuth();
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
        const query: any = supabase
          .from("timetables")
          .select("id,class_id,school_id,is_active,created_at,created_by,version")
          .eq("school_id", user.school_id)
          .eq("term", term);
        
        const { data, error } = await query;

        if (error) {
          console.error("Supabase error:", error);
          setErrorMsg("Error fetching timetable draft: " + error.message);
          setRows([]);
        } else if (!data || data.length === 0) {
          setErrorMsg("No valid draft timetable found.");
          setRows([]);
        } else {
          setRows(data as TimetableRow[]);
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
    setLoading(true);
    try {
      const { error } = await supabase
        .from("timetables")
        .update({ is_active: true })
        .eq("school_id", user.school_id)
        .eq("term", term);
      
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
                <th className="border px-2 py-1">Active</th>
                <th className="border px-2 py-1">Created At</th>
                <th className="border px-2 py-1">Created By</th>
                <th className="border px-2 py-1">Version</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="border px-2 py-1">{r.class_id}</td>
                  <td className="border px-2 py-1">{r.school_id ?? "-"}</td>
                  <td className="border px-2 py-1">{r.is_active ? "Yes" : "No"}</td>
                  <td className="border px-2 py-1">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="border px-2 py-1">{r.created_by ?? "-"}</td>
                  <td className="border px-2 py-1">{r.version ?? "-"}</td>
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
