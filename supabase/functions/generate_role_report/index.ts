
// Edge Function: generate_role_report
// Generates role-specific reports with proper data scoping

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let event;
  try {
    event = await req.json();
  } catch (error) {
    console.error("Invalid JSON:", error);
    return new Response(JSON.stringify({ error: "Invalid JSON request" }), { 
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const { role, school_id, class_id, type, term, user_id } = event;
  
  console.log('Report request:', { role, school_id, class_id, type, term, user_id });
  
  if (!role || !type || !term) {
    return new Response(JSON.stringify({ 
      error: "Missing required parameters: role, type, term are required" 
    }), { 
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const SUPABASE_URL = "https://lmqyizrnuahkmwauonqr.supabase.co";
  const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!SUPABASE_SERVICE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is missing");
    return new Response(JSON.stringify({ 
      error: "Service configuration error" 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Get school info if school_id provided
  let schoolInfo = null;
  if (school_id) {
    try {
      const { data, error } = await supabase
        .from("schools")
        .select("id, name, logo_url, location")
        .eq("id", school_id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching school:", error);
      } else {
        schoolInfo = data;
      }
    } catch (error) {
      console.error("School fetch error:", error);
    }
  }

  let resultRows = [];
  let reportTitle = "";
  let hasError = false;
  let errorMessage = "";

  try {
    if (type === "grades") {
      reportTitle = `Grades Report - ${term}`;
      
      if (role === "teacher") {
        if (!class_id) {
          throw new Error("Class ID required for teacher grades report");
        }
        
        const { data, error } = await supabase
          .from("grades")
          .select(`
            id,
            score,
            max_score,
            percentage,
            letter_grade,
            term,
            exam_type,
            status,
            created_at,
            students!grades_student_id_fkey(id, name, admission_number),
            subjects!grades_subject_id_fkey(id, name, code),
            classes!grades_class_id_fkey(id, name)
          `)
          .eq("class_id", class_id)
          .eq("term", term)
          .in("status", ["submitted", "approved", "released"])
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Teacher grades query error:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        resultRows = (data || []).map(grade => ({
          Student: grade.students?.name || 'N/A',
          AdmissionNumber: grade.students?.admission_number || 'N/A',
          Subject: grade.subjects?.name || 'N/A',
          SubjectCode: grade.subjects?.code || 'N/A',
          Score: grade.score || 0,
          MaxScore: grade.max_score || 100,
          Percentage: grade.percentage || 0,
          LetterGrade: grade.letter_grade || 'N/A',
          ExamType: grade.exam_type || 'N/A',
          Status: grade.status || 'draft',
          Date: grade.created_at ? new Date(grade.created_at).toLocaleDateString() : 'N/A'
        }));
        
      } else if (role === "principal" || role === "school_owner") {
        if (!school_id) {
          throw new Error("School ID required for principal/school owner grades report");
        }
        
        const { data, error } = await supabase
          .from("grades")
          .select(`
            id,
            score,
            max_score,
            percentage,
            letter_grade,
            term,
            exam_type,
            status,
            created_at,
            students!grades_student_id_fkey(id, name, admission_number),
            subjects!grades_subject_id_fkey(id, name, code),
            classes!grades_class_id_fkey(id, name)
          `)
          .eq("school_id", school_id)
          .eq("term", term)
          .in("status", ["submitted", "approved", "released"])
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Principal grades query error:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        resultRows = (data || []).map(grade => ({
          Student: grade.students?.name || 'N/A',
          AdmissionNumber: grade.students?.admission_number || 'N/A',
          Class: grade.classes?.name || 'N/A',
          Subject: grade.subjects?.name || 'N/A',
          Score: grade.score || 0,
          MaxScore: grade.max_score || 100,
          Percentage: grade.percentage || 0,
          LetterGrade: grade.letter_grade || 'N/A',
          Status: grade.status || 'draft',
          Date: grade.created_at ? new Date(grade.created_at).toLocaleDateString() : 'N/A'
        }));
        
      } else if (role === "edufam_admin") {
        let query = supabase
          .from("grades")
          .select(`
            id,
            score,
            max_score,
            percentage,
            letter_grade,
            term,
            school_id,
            students!grades_student_id_fkey(id, name, admission_number),
            subjects!grades_subject_id_fkey(id, name, code),
            classes!grades_class_id_fkey(id, name),
            schools!grades_school_id_fkey(id, name)
          `)
          .eq("term", term)
          .in("status", ["submitted", "approved", "released"])
          .order('created_at', { ascending: false });
        
        if (school_id) {
          query = query.eq("school_id", school_id);
          reportTitle = `Grades Report - ${schoolInfo?.name || 'Selected School'} - ${term}`;
        } else {
          reportTitle = `Grades Report - All Schools - ${term}`;
        }

        const { data, error } = await query;
        if (error) {
          console.error("Admin grades query error:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        resultRows = (data || []).map(grade => ({
          School: grade.schools?.name || 'N/A',
          Student: grade.students?.name || 'N/A',
          AdmissionNumber: grade.students?.admission_number || 'N/A',
          Class: grade.classes?.name || 'N/A',
          Subject: grade.subjects?.name || 'N/A',
          Score: grade.score || 0,
          Percentage: grade.percentage || 0,
          LetterGrade: grade.letter_grade || 'N/A'
        }));
      } else {
        throw new Error(`Role ${role} is not authorized for grades reports`);
      }
      
    } else if (type === "attendance") {
      reportTitle = `Attendance Report - ${term}`;
      
      if (role === "teacher") {
        if (!class_id) {
          throw new Error("Class ID required for teacher attendance report");
        }
        
        const { data, error } = await supabase
          .from("attendance")
          .select(`
            id,
            date,
            status,
            session,
            term,
            students!attendance_student_id_fkey(id, name, admission_number),
            classes!attendance_class_id_fkey(id, name)
          `)
          .eq("class_id", class_id)
          .eq("term", term)
          .order('date', { ascending: false });
          
        if (error) {
          console.error("Teacher attendance query error:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        resultRows = (data || []).map(attendance => ({
          Student: attendance.students?.name || 'N/A',
          AdmissionNumber: attendance.students?.admission_number || 'N/A',
          Date: attendance.date || 'N/A',
          Status: attendance.status || 'N/A',
          Session: attendance.session || 'N/A'
        }));
        
      } else if (role === "principal" || role === "school_owner") {
        if (!school_id) {
          throw new Error("School ID required for principal/school owner attendance report");
        }
        
        const { data, error } = await supabase
          .from("attendance")
          .select(`
            id,
            date,
            status,
            session,
            term,
            students!attendance_student_id_fkey(id, name, admission_number),
            classes!attendance_class_id_fkey(id, name)
          `)
          .eq("school_id", school_id)
          .eq("term", term)
          .order('date', { ascending: false });
          
        if (error) {
          console.error("Principal attendance query error:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        resultRows = (data || []).map(attendance => ({
          Student: attendance.students?.name || 'N/A',
          AdmissionNumber: attendance.students?.admission_number || 'N/A',
          Class: attendance.classes?.name || 'N/A',
          Date: attendance.date || 'N/A',
          Status: attendance.status || 'N/A',
          Session: attendance.session || 'N/A'
        }));
        
      } else if (role === "edufam_admin") {
        let query = supabase
          .from("attendance")
          .select(`
            id,
            date,
            status,
            session,
            term,
            school_id,
            students!attendance_student_id_fkey(id, name, admission_number),
            classes!attendance_class_id_fkey(id, name),
            schools!attendance_school_id_fkey(id, name)
          `)
          .eq("term", term)
          .order('date', { ascending: false });

        if (school_id) {
          query = query.eq("school_id", school_id);
          reportTitle = `Attendance Report - ${schoolInfo?.name || 'Selected School'} - ${term}`;
        } else {
          reportTitle = `Attendance Report - All Schools - ${term}`;
        }
        
        const { data, error } = await query;
        if (error) {
          console.error("Admin attendance query error:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        resultRows = (data || []).map(attendance => ({
          School: attendance.schools?.name || 'N/A',
          Student: attendance.students?.name || 'N/A',
          AdmissionNumber: attendance.students?.admission_number || 'N/A',
          Class: attendance.classes?.name || 'N/A',
          Date: attendance.date || 'N/A',
          Status: attendance.status || 'N/A'
        }));
      } else {
        throw new Error(`Role ${role} is not authorized for attendance reports`);
      }
      
    } else if (type === "finance") {
      reportTitle = `Finance Report - ${term}`;
      
      if (role === "finance_officer" || role === "principal" || role === "school_owner") {
        if (!school_id) {
          throw new Error("School ID required for finance report");
        }
        
        const { data, error } = await supabase
          .from("fees")
          .select(`
            id,
            amount,
            paid_amount,
            category,
            status,
            due_date,
            term,
            students!fees_student_id_fkey(id, name, admission_number),
            classes!fees_class_id_fkey(id, name)
          `)
          .eq("school_id", school_id)
          .eq("term", term)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Finance query error:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        resultRows = (data || []).map(fee => ({
          Student: fee.students?.name || 'N/A',
          AdmissionNumber: fee.students?.admission_number || 'N/A',
          Class: fee.classes?.name || 'N/A',
          Category: fee.category || 'N/A',
          Amount: fee.amount || 0,
          PaidAmount: fee.paid_amount || 0,
          Outstanding: (fee.amount || 0) - (fee.paid_amount || 0),
          Status: fee.status || 'pending',
          DueDate: fee.due_date || 'N/A'
        }));
        
      } else if (role === "edufam_admin") {
        let query = supabase
          .from("fees")
          .select(`
            id,
            amount,
            paid_amount,
            category,
            status,
            due_date,
            term,
            school_id,
            students!fees_student_id_fkey(id, name, admission_number),
            schools!fees_school_id_fkey(id, name)
          `)
          .eq("term", term)
          .order('created_at', { ascending: false });

        if (school_id) {
          query = query.eq("school_id", school_id);
          reportTitle = `Finance Report - ${schoolInfo?.name || 'Selected School'} - ${term}`;
        } else {
          reportTitle = `Finance Report - All Schools - ${term}`;
        }
        
        const { data, error } = await query;
        if (error) {
          console.error("Admin finance query error:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        resultRows = (data || []).map(fee => ({
          School: fee.schools?.name || 'N/A',
          Student: fee.students?.name || 'N/A',
          AdmissionNumber: fee.students?.admission_number || 'N/A',
          Category: fee.category || 'N/A',
          Amount: fee.amount || 0,
          PaidAmount: fee.paid_amount || 0,
          Outstanding: (fee.amount || 0) - (fee.paid_amount || 0),
          Status: fee.status || 'pending'
        }));
      } else {
        throw new Error(`Role ${role} is not authorized for finance reports`);
      }
      
    } else {
      throw new Error(`Unknown report type: ${type}`);
    }

  } catch (error) {
    console.error('Report generation error:', error);
    hasError = true;
    errorMessage = error.message || 'Unknown error occurred';
    resultRows = [];
  }

  // Include metadata and error handling
  const metaData = {
    School: schoolInfo?.name || "N/A",
    "Report Title": reportTitle,
    Term: term,
    Generated: new Date().toLocaleString(),
    "Generated By": role,
    Company: "EduFam Systems",
    "Total Records": resultRows.length,
    ...(hasError && { Error: errorMessage })
  };

  // Build Excel file
  try {
    // Create worksheet data with metadata at top
    const worksheetData = [
      metaData,
      {},  // Empty row for separation
      ...resultRows
    ];

    const sheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Set column widths for better readability
    const colWidths = Object.keys(resultRows[0] || {}).map(() => ({ wch: 15 }));
    sheet['!cols'] = colWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Report");
    
    const xlsxData = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    if (!xlsxData || xlsxData.length === 0) {
      throw new Error("Failed to generate Excel data");
    }

    const filename = `${reportTitle.replace(/[^a-zA-Z0-9]/g,"_")}_${new Date().toISOString().split('T')[0]}.xlsx`;

    console.log(`Report generated successfully: ${filename}, ${xlsxData.length} bytes`);

    return new Response(xlsxData, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`
      },
    });
    
  } catch (error) {
    console.error('Excel generation error:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to generate Excel file", 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
