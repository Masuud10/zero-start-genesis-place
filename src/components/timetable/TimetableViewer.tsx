
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TimetableRow {
  id: string;
  class_id: string;
  // Remove subject_id, teacher_id, day_of_week, start_time, end_time (which do not exist as per your Supabase schema)
  school_id?: string;
  is_active?: boolean;
  created_at?: string;
  created_by?: string;
  version?: number;
}

interface TimetableViewerProps {
  term: string;
  classId?: string;
  studentId?: string;
}

const TimetableViewer: React.FC<TimetableViewerProps> = ({
  term,
  classId,
  studentId,
}) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  let filter: Record<string, any> = {};
  if (user.role === "teacher") {
    filter = { teacher_id: user.id }; // might not work if teacher_id not in table
  } else if (user.role === "student" && classId) {
    filter = { class_id: classId };
  } else if (user.role === "parent" && studentId && classId) {
    filter = { class_id: classId };
  }

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setErrorMsg(null);

      let q = supabase
        .from("timetables")
        .select("id,class_id,school_id,is_active,created_at,created_by,version")
        .eq("school_id", user.school_id)
        .eq("term", term)
        .eq("is_published", true);

      Object.entries(filter).forEach(([k, v]) => {
        q = q.eq(k, v);
      });
      const { data, error } = await q;
      if (error) {
        setErrorMsg("Error loading timetable: " + error.message);
        setRows([]);
      } else if (!Array.isArray(data) || data.some((row) => !row?.id || !row?.class_id)) {
        setErrorMsg("No timetable found.");
        setRows([]);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user?.school_id, term, classId, studentId]);

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
      )}
    </div>
  );
};

export default TimetableViewer;
