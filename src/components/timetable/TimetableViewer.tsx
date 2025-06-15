
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TimetableViewerProps {
  term: string;
  classId?: string;
  studentId?: string;
}

// Updated to fully match the new 'timetables' table schema
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
  term: string | null; // Added missing term field
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

  // Define a more specific type for the filter to help TypeScript inference
  type FilterKey = "teacher_id" | "class_id";
  const filter: Partial<Record<FilterKey, string>> = {};

  if (user?.role === "teacher") {
    filter.teacher_id = user.id;
  } else if (user?.role === "student" && classId) {
    filter.class_id = classId;
  } else if (user?.role === "parent" && studentId && classId) {
    filter.class_id = classId;
  }

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        let q = supabase
          .from("timetables")
          .select("*")
          .eq("school_id", user.school_id)
          .eq("term", term)
          .eq("is_published", true)
          .order('day_of_week')
          .order('start_time');

        // Apply dynamic filters in a type-safe way
        (Object.keys(filter) as FilterKey[]).forEach((key) => {
          if (filter[key]) {
            q = q.eq(key, filter[key]);
          }
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
              <th className="border px-2 py-1">Day</th>
              <th className="border px-2 py-1">Time</th>
              <th className="border px-2 py-1">Class</th>
              <th className="border px-2 py-1">Subject</th>
              <th className="border px-2 py-1">Teacher</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="border px-2 py-1">{r.day_of_week}</td>
                <td className="border px-2 py-1">{r.start_time} - {r.end_time}</td>
                <td className="border px-2 py-1">{r.class_id}</td>
                <td className="border px-2 py-1">{r.subject_id}</td>
                <td className="border px-2 py-1">{r.teacher_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TimetableViewer;
