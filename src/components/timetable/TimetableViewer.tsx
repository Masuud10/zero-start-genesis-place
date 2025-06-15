
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TimetableViewerProps {
  term: string;
  classId?: string;
  studentId?: string;
}

// This is the raw row from DB
interface TimetableDbRow {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

// This is the enriched row for display
interface TimetableDisplayRow extends TimetableDbRow {
    className: string;
    subjectName: string;
    teacherName: string;
}

const TimetableViewer: React.FC<TimetableViewerProps> = ({
  term,
  classId,
  studentId,
}) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<TimetableDisplayRow[]>([]);
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
    const fetchTimetable = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        let q = supabase
          .from("timetables")
          .select("id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time")
          .eq("school_id", user!.school_id!)
          .eq("term", term)
          .eq("is_published", true)
          .order('day_of_week')
          .order('start_time');

        // Apply dynamic filters in a type-safe way
        (Object.keys(filter) as FilterKey[]).forEach((key) => {
          if (filter[key]) {
            q = q.eq(key, filter[key]!);
          }
        });
        
        const { data: timetableData, error: timetableError } = await q;
        
        if (timetableError) throw timetableError;

        if (!timetableData || timetableData.length === 0) {
          setErrorMsg("No published timetable found for this class and term.");
          setRows([]);
          return;
        }

        const classIds = [...new Set(timetableData.map(r => r.class_id))];
        const subjectIds = [...new Set(timetableData.map(r => r.subject_id))];
        const teacherIds = [...new Set(timetableData.map(r => r.teacher_id))];

        const [
            { data: classesData, error: classesError },
            { data: subjectsData, error: subjectsError },
            { data: teachersData, error: teachersError }
        ] = await Promise.all([
            supabase.from('classes').select('id, name').in('id', classIds),
            supabase.from('subjects').select('id, name').in('id', subjectIds),
            supabase.from('profiles').select('id, name').in('id', teacherIds)
        ]);

        if (classesError || subjectsError || teachersError) {
            throw classesError || subjectsError || teachersError;
        }

        const classMap = new Map(classesData?.map(c => [c.id, c.name]));
        const subjectMap = new Map(subjectsData?.map(s => [s.id, s.name]));
        const teacherMap = new Map(teachersData?.map(t => [t.id, t.name]));

        const formattedRows: TimetableDisplayRow[] = timetableData.map(row => ({
            ...row,
            className: classMap.get(row.class_id) || row.class_id,
            subjectName: subjectMap.get(row.subject_id) || row.subject_id,
            teacherName: teacherMap.get(row.teacher_id) || row.teacher_id,
        }));
        
        setRows(formattedRows);

      } catch (err: any) {
        console.error("Error loading timetable data:", err);
        setErrorMsg("Failed to load timetable: " + err.message);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.school_id && (classId || user?.role === 'teacher')) {
      fetchTimetable();
    } else if (!classId && user?.role === 'parent') {
        // Don't fetch if parent role but no classId, parent view handles this state
        setLoading(false);
        setRows([]);
    }
  }, [user?.school_id, user?.id, user?.role, term, classId, studentId, JSON.stringify(filter)]);

  return (
    <div>
      {loading ? (
        <p>Loading timetable...</p>
      ) : errorMsg ? (
        <p className="text-red-500">{errorMsg}</p>
      ) : rows.length === 0 ? (
        <p>No published timetable found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3">Day</th>
                <th scope="col" className="px-4 py-3">Time</th>
                <th scope="col" className="px-4 py-3">Class</th>
                <th scope="col" className="px-4 py-3">Subject</th>
                <th scope="col" className="px-4 py-3">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.day_of_week}</td>
                  <td className="px-4 py-3">{r.start_time} - {r.end_time}</td>
                  <td className="px-4 py-3">{r.className}</td>
                  <td className="px-4 py-3">{r.subjectName}</td>
                  <td className="px-4 py-3">{r.teacherName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimetableViewer;
