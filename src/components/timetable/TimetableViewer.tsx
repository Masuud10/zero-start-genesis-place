
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TimetableViewerProps {
  term: string;
  classId?: string;
  studentId?: string;
}

interface TimetableRow {
  id: string;
  class_id: string;
  school_id: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
  version: number;
}

const TimetableViewer: React.FC<TimetableViewerProps> = ({
  term,
  classId,
  studentId,
}) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<TimetableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  let filter: Record<string, any> = {};
  if (user?.role === "teacher") {
    filter = { teacher_id: user.id };
  } else if (user?.role === "student" && classId) {
    filter = { class_id: classId };
  } else if (user?.role === "parent" && studentId && classId) {
    filter = { class_id: classId };
  }

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        let q: any = supabase
          .from("timetables")
          .select("id,class_id,school_id,is_active,created_at,created_by,version")
          .eq("school_id", user.school_id)
          .eq("term", term);

        Object.entries(filter).forEach(([k, v]) => {
          q = q.eq(k, v);
        });
        
        const { data, error } = await q;
        
        if (error) {
          console.error("Supabase error:", error);
          setErrorMsg("Error loading timetable: " + error.message);
          setRows([]);
        } else if (!data || data.length === 0) {
          setErrorMsg("No timetable found.");
          setRows([]);
        } else {
          setRows(data as TimetableRow[]);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setErrorMsg("Error loading timetable: " + err.message);
        setRows([]);
      }
      setLoading(false);
    };
    
    if (user?.school_id) {
      fetch();
    }
  }, [user?.school_id, term, classId, studentId, JSON.stringify(filter)]);

  return (
    <div>
      {loading ? (
        <div>Loading timetable...</div>
      ) : errorMsg ? (
        <div className="text-red-500">{errorMsg}</div>
      ) : rows.length === 0 ? (
        <div>No published timetable found.</div>
      ) : (
        <table className="border w-full">
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
      )}
    </div>
  );
};

export default TimetableViewer;
