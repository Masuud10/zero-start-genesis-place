
// Edge Function: Calculate & upsert per-class analytics
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- CONFIGURE PROJECT URL/KEY (or rely on injected env in deploy) ---
    const SUPABASE_URL = "https://lmqyizrnuahkmwauonqr.supabase.co";
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!SUPABASE_SERVICE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY must be set in this function's environment.");
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // --- PARAMETERS: reporting period etc ---
    const input = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const { period, term, year, debug, schoolId, classId } = input;

    // -- Which schools to process? --
    let schools = [];
    if (schoolId) {
      schools.push({ id: schoolId });
    } else {
      const { data, error } = await supabase
        .from("schools")
        .select("id");
      if (error) throw error;
      schools = data;
    }
    let results = [];

    for (const school of schools) {
      // Which classes in this school?
      let classQuery = supabase
        .from("classes")
        .select("id")
        .eq("school_id", school.id);
      if (classId) {
        classQuery = classQuery.eq("id", classId);
      }
      const { data: classes, error: classesErr } = await classQuery;
      if (classesErr) throw classesErr;

      // -- For each class, aggregate data
      for (const c of classes) {
        // 1. Grade performance (period, previous)
        let cur_period = period || null;
        let reportingPeriod = cur_period;
        let [avgGrade, prevAvgGrade] = [null, null];

        // Get all grades for this class
        const { data: gradeRows, error: gradeErr } = await supabase
          .from("grades")
          .select("score, max_score, subject_id, term, year, created_at")
          .eq("class_id", c.id)
          .order("created_at", { ascending: false });
        if (gradeErr) throw gradeErr;

        // Aggregate by reporting period, subject
        let gradesByTerm: Record<string, { scores: number[], maxScores: number[], bySubject: Record<string, number[]> }> = {};
        for (let g of gradeRows) {
          const key = (g.term || "unknown") + "-" + (g.year || "");
          if (!gradesByTerm[key]) gradesByTerm[key] = { scores: [], maxScores: [], bySubject: {} };
          gradesByTerm[key].scores.push(g.score);
          gradesByTerm[key].maxScores.push(g.max_score);
          if (g.subject_id) {
            if (!gradesByTerm[key].bySubject[g.subject_id]) gradesByTerm[key].bySubject[g.subject_id] = [];
            gradesByTerm[key].bySubject[g.subject_id].push(g.score);
          }
        }
        // Get periods sorted by recency
        const periods = Object.keys(gradesByTerm).sort((a, b) => b.localeCompare(a));
        let p0 = periods[0];
        let p1 = periods[1];

        avgGrade = p0
          ? (gradesByTerm[p0].scores.reduce((a, b) => a + b, 0) / gradesByTerm[p0].scores.length) || null
          : null;
        prevAvgGrade = p1
          ? (gradesByTerm[p1].scores.reduce((a, b) => a + b, 0) / gradesByTerm[p1].scores.length) || null
          : null;
        let improvement = (avgGrade && prevAvgGrade) ? avgGrade - prevAvgGrade : null;
        let trend = improvement === null ? "stable"
          : improvement > 5 ? "up"
          : improvement < -5 ? "down"
          : "stable";

        // Top students (latest period)
        // Get averages per student for current period
        const { data: students, error: stErr } = await supabase
          .from("students")
          .select("id")
          .eq("class_id", c.id)
          .eq("school_id", school.id)
          .eq("is_active", true);
        if (stErr) throw stErr;
        let top_students: Array<{ student_id: string, avg_grade: number }> = [];
        if (students && p0 && gradeRows.length) {
          for (let s of students) {
            const sGrades = gradeRows.filter(gr =>
              gr.term + "-" + (gr.year || "") === p0 && gr.student_id === s.id);
            if (sGrades.length) {
              const avg = sGrades.reduce((a, g) => a + g.score, 0) / sGrades.length;
              top_students.push({ student_id: s.id, avg_grade: avg });
            }
          }
          top_students = top_students.sort((a, b) => b.avg_grade - a.avg_grade).slice(0, 5);
        }

        // Subject stats (best, weakest for current period)
        let best_subjects = [];
        let weakest_subjects = [];
        if (p0) {
          const subjScores: Record<string, number[]> = gradesByTerm[p0].bySubject || {};
          let entries = Object.entries(subjScores)
            .map(([subject_id, arr]) => ({
              subject_id,
              avg_score: arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
            }))
            .filter(e => e.avg_score !== null);
          entries = entries.sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0));
          best_subjects = entries.slice(0, 2);
          weakest_subjects = entries.slice(-2);
        }

        // Attendance
        const { data: attRows, error: attErr } = await supabase
          .from("attendance")
          .select("status")
          .eq("class_id", c.id)
          .eq("school_id", school.id);
        // Summarize
        let present = 0, absent = 0, attendanceRate = null;
        if (attRows) {
          const fullRows = Array.isArray(attRows) ? attRows : [attRows];
          present = fullRows.filter(a => a.status === "present").length;
          absent = fullRows.filter(a => a.status === "absent").length;
          const total = present + absent;
          attendanceRate = total > 0 ? (present * 100 / total) : null;
        }
        let low_attendance_count = absent; // Could refine this metric

        // Financials
        // Fees collected
        let { data: feeRows, error: feeErr } = await supabase
          .from("fees")
          .select("amount, paid_amount, status")
          .eq("class_id", c.id)
          .eq("school_id", school.id);
        if (feeErr) throw feeErr;

        let fee_collection = 0, outstanding_fees = 0;
        for (const f of feeRows || []) {
          fee_collection += f.paid_amount || 0;
          if ((f.status !== "paid" || !f.paid_amount) && f.amount) {
            outstanding_fees += f.amount - (f.paid_amount || 0);
          }
        }

        // -- UPSERT into class_analytics --
        const upsert = {
          class_id: c.id,
          school_id: school.id,
          reporting_period: p0 || period,
          term: term,
          year: year,
          avg_grade: avgGrade,
          prev_avg_grade: prevAvgGrade,
          performance_trend: trend,
          improvement,
          top_students,
          weakest_subjects,
          best_subjects,
          attendance_rate: attendanceRate,
          low_attendance_count,
          fee_collection,
          outstanding_fees,
        };
        const { data: upserted, error: upErr } = await supabase
          .from("class_analytics")
          .upsert(upsert, { onConflict: "class_id, reporting_period" })
          .select();
        if (upErr) throw upErr;
        results.push({ class_id: c.id, reporting_period: p0 || period, avg_grade: avgGrade, attendance: attendanceRate });
      }
    }

    return new Response(
      JSON.stringify({ status: "ok", processed: results.length, detail: debug ? results : undefined }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

