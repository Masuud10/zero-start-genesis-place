
// Edge Function: Calculate & upsert per-student analytics
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
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''; // Service Key needed for RLS-bypassing aggregation.
    if (!SUPABASE_SERVICE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY must be set in this function's environment.");
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // --- PARAMETERS: reporting period, e.g. { period: "2025-T2", term: "T2", year: "2025" } ---
    const input = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const { period, term, year, debug, schoolId } = input;

    // -- STEP 1: which schools to process? --
    // If schoolId specified, limit to that; otherwise process all.
    let schools = [];
    if (schoolId) {
      // process only the provided school
      schools.push({ id: schoolId });
    } else {
      const { data, error } = await supabase
        .from("schools")
        .select("id");
      if (error) throw error;
      schools = data;
    }
    const results = [];

    // -- STEP 2: For each school, aggregate per-student analytics
    for (const school of schools) {
      // Students at this school
      const { data: students, error: studErr } = await supabase
        .from("students")
        .select("id, class_id")
        .eq("school_id", school.id)
        .eq("is_active", true);
      if (studErr) throw studErr;

      for (const student of students) {
        // 2.1: Aggregated grade data (last & prev period)
        const cur_period = period || null;
        const latest_period = cur_period;
        // Get this student's average for selected/reporting period & previous
        let [gradeThis, gradePrev] = [null, null];

        // Query grade averages by term (or latest two periods)
        const { data: gradeRows, error: gradeErr } = await supabase
          .from("grades")
          .select("score, max_score, term, id, created_at")
          .eq("student_id", student.id)
          .order("created_at", { ascending: false });
        if (gradeErr) throw gradeErr;
        // Simple approach: pick last 2 unique periods in term/year, compute averages and improvement
        const gradesByPeriod: Record<string, { scores: number[], maxScores: number[] }> = {};
        for (const g of gradeRows) {
          const key = g.term || "unknown";
          if (!gradesByPeriod[key]) gradesByPeriod[key] = { scores: [], maxScores: [] };
          gradesByPeriod[key].scores.push(g.score);
          gradesByPeriod[key].maxScores.push(g.max_score);
        }
        // flatten and sort periods by recency
        const periods = Object.keys(gradesByPeriod).sort((a, b) => b.localeCompare(a));
        const p0 = periods[0];
        const p1 = periods[1];
        gradeThis = p0 
          ? (gradesByPeriod[p0].scores.reduce((a,b)=>a+b,0)/gradesByPeriod[p0].scores.length) || null
          : null;
        gradePrev = p1 
          ? (gradesByPeriod[p1].scores.reduce((a,b)=>a+b,0)/gradesByPeriod[p1].scores.length) || null
          : null;
        const improvement = (gradeThis && gradePrev) ? gradeThis - gradePrev : null;
        const trend = improvement === null ? "stable"
          : improvement > 5 ? "up"
          : improvement < -5 ? "down"
          : "stable";

        // 2.2: Attendance
        const { data: attRows, error: attErr } = await supabase
          .from("attendance")
          .select("status")
          .eq("student_id", student.id)
          .eq("school_id", school.id)
          .maybeSingle();
        // Summarize attendance: present/absent count
        let present = 0, absent = 0, attendanceRate = null;
        if (attRows) {
          // If attRows is an array (should be), count present/absent
          const fullRows = Array.isArray(attRows) ? attRows : [attRows];
          present = fullRows.filter(a => a.status === "present").length;
          absent  = fullRows.filter(a => a.status === "absent").length;
          const total = present + absent;
          attendanceRate = total > 0 ? (present*100/total) : null;
        }

        // 2.3: Detect low attendance flag
        const low_attendance = attendanceRate !== null && attendanceRate < 75;

        // -- UPSERT into student_analytics --
        const upsert = {
          student_id: student.id,
          school_id: school.id,
          class_id: student.class_id,
          reporting_period: p0 || period,
          term: term,
          year: year,
          avg_grade: gradeThis,
          prev_avg_grade: gradePrev,
          performance_trend: trend,
          improvement: improvement,
          attendance_rate: attendanceRate,
          absences: absent,
          present: present,
          low_attendance: low_attendance,
        };
        const { data: upserted, error: upErr } = await supabase
          .from("student_analytics")
          .upsert(upsert, { onConflict: "student_id, reporting_period" })
          .select();
        if (upErr) throw upErr;
        results.push({ student_id: student.id, reporting_period: p0 || period, avg_grade: gradeThis, attendanceRate });
      }
    }
    return new Response(
      JSON.stringify({ status: 'ok', processed: results.length, detail: debug ? results : undefined }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
