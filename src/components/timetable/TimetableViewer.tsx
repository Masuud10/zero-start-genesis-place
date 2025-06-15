
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
  subject_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subjects?: { name?: string };
  profiles?: { name?: string };
}

const TimetableViewer: React.FC<TimetableViewerProps> = ({ term, classId, studentId }) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<TimetableRow[]>([]);
  const [loading, setLoading] = useState(true);

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
      let q = supabase.from("timetables").select("*, subjects(name), profiles:teacher_id(name)")
        .eq("school_id", user.school_id)
        .eq("term", term)
        .eq("is_published", true);
      Object.entries(filter).forEach(([k, v]) => { q = q.eq(k, v); });
      const { data } = await q;
      setRows(data || []);
      setLoading(false);
    };
    fetch();
  }, [user?.school_id, term, classId, studentId]);

  return (
    <div>
      {loading ? (
        <div>Loading timetable...</div>
      ) : (
        <table className="border w-full">
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
      )}
    </div>
  );
};

export default TimetableViewer;
