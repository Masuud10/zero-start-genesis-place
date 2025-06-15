import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TimetableViewerProps {
  term: string;
  classId?: string;
  studentId?: string;
}

const TimetableViewer: React.FC<any> = ({
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
    filter = { teacher_id: user.id };
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
        setRows(data as any[]); // Always cast as any[]
      }
      setLoading(false);
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.school_id, term, classId, studentId]);

  // Safety: always use `any[]` for mapping
  const safeRows: any[] = Array.isArray(rows) ? rows : [];

  return (
    <div>
      {loading ? (
        <div>Loading timetable...</div>
      ) : errorMsg ? (
        <div className="text-red-500">{errorMsg}</div>
      ) : safeRows.length === 0 ? (
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
            {safeRows.map((r: any) => (
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
