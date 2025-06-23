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

  // Get comprehensive school info for header
  let schoolInfo = null;
  if (school_id) {
    try {
      const { data, error } = await supabase
        .from("schools")
        .select(`
          id, 
          name, 
          logo_url, 
          location, 
          address,
          phone,
          email,
          motto,
          slogan,
          principal_name,
          principal_contact,
          registration_number,
          website_url
        `)
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
      reportTitle = `Academic Performance Report - ${term}`;
      
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
            comments,
            students!grades_student_id_fkey(id, name, admission_number, roll_number),
            subjects!grades_subject_id_fkey(id, name, code),
            classes!grades_class_id_fkey(id, name, level, stream)
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
          'Student Name': grade.students?.name || 'N/A',
          'Admission Number': grade.students?.admission_number || 'N/A',
          'Roll Number': grade.students?.roll_number || 'N/A',
          'Subject': grade.subjects?.name || 'N/A',
          'Subject Code': grade.subjects?.code || 'N/A',
          'Score': grade.score || 0,
          'Max Score': grade.max_score || 100,
          'Percentage': `${(grade.percentage || 0).toFixed(1)}%`,
          'Letter Grade': grade.letter_grade || 'N/A',
          'Exam Type': grade.exam_type || 'N/A',
          'Status': grade.status || 'draft',
          'Comments': grade.comments || '',
          'Date Recorded': grade.created_at ? new Date(grade.created_at).toLocaleDateString() : 'N/A'
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
            comments,
            students!grades_student_id_fkey(id, name, admission_number, roll_number),
            subjects!grades_subject_id_fkey(id, name, code),
            classes!grades_class_id_fkey(id, name, level, stream)
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
          'Student Name': grade.students?.name || 'N/A',
          'Admission Number': grade.students?.admission_number || 'N/A',
          'Roll Number': grade.students?.roll_number || 'N/A',
          'Class': grade.classes?.name || 'N/A',
          'Level': grade.classes?.level || 'N/A',
          'Stream': grade.classes?.stream || 'N/A',
          'Subject': grade.subjects?.name || 'N/A',
          'Subject Code': grade.subjects?.code || 'N/A',
          'Score': grade.score || 0,
          'Max Score': grade.max_score || 100,
          'Percentage': `${(grade.percentage || 0).toFixed(1)}%`,
          'Letter Grade': grade.letter_grade || 'N/A',
          'Exam Type': grade.exam_type || 'N/A',
          'Status': grade.status || 'draft',
          'Comments': grade.comments || '',
          'Date Recorded': grade.created_at ? new Date(grade.created_at).toLocaleDateString() : 'N/A'
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
          reportTitle = `Academic Performance Report - ${schoolInfo?.name || 'Selected School'} - ${term}`;
        } else {
          reportTitle = `Academic Performance Report - All Schools - ${term}`;
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
            notes,
            students!attendance_student_id_fkey(id, name, admission_number, roll_number),
            classes!attendance_class_id_fkey(id, name, level, stream)
          `)
          .eq("class_id", class_id)
          .eq("term", term)
          .order('date', { ascending: false });
          
        if (error) {
          console.error("Teacher attendance query error:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        resultRows = (data || []).map(attendance => ({
          'Student Name': attendance.students?.name || 'N/A',
          'Admission Number': attendance.students?.admission_number || 'N/A',
          'Roll Number': attendance.students?.roll_number || 'N/A',
          'Class': attendance.classes?.name || 'N/A',
          'Date': attendance.date || 'N/A',
          'Status': attendance.status || 'N/A',
          'Session': attendance.session || 'N/A',
          'Notes': attendance.notes || ''
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
            notes,
            students!attendance_student_id_fkey(id, name, admission_number, roll_number),
            classes!attendance_class_id_fkey(id, name, level, stream)
          `)
          .eq("school_id", school_id)
          .eq("term", term)
          .order('date', { ascending: false });
          
        if (error) {
          console.error("Principal attendance query error:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        resultRows = (data || []).map(attendance => ({
          'Student Name': attendance.students?.name || 'N/A',
          'Admission Number': attendance.students?.admission_number || 'N/A',
          'Roll Number': attendance.students?.roll_number || 'N/A',
          'Class': attendance.classes?.name || 'N/A',
          'Level': attendance.classes?.level || 'N/A',
          'Stream': attendance.classes?.stream || 'N/A',
          'Date': attendance.date || 'N/A',
          'Status': attendance.status || 'N/A',
          'Session': attendance.session || 'N/A',
          'Notes': attendance.notes || ''
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
      reportTitle = `Financial Report - ${term}`;
      
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
            payment_method,
            transaction_reference,
            students!fees_student_id_fkey(id, name, admission_number, roll_number),
            classes!fees_class_id_fkey(id, name, level, stream)
          `)
          .eq("school_id", school_id)
          .eq("term", term)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Finance query error:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        resultRows = (data || []).map(fee => ({
          'Student Name': fee.students?.name || 'N/A',
          'Admission Number': fee.students?.admission_number || 'N/A',
          'Roll Number': fee.students?.roll_number || 'N/A',
          'Class': fee.classes?.name || 'N/A',
          'Level': fee.classes?.level || 'N/A',
          'Stream': fee.classes?.stream || 'N/A',
          'Fee Category': fee.category || 'N/A',
          'Amount Due': `KES ${(fee.amount || 0).toLocaleString()}`,
          'Amount Paid': `KES ${(fee.paid_amount || 0).toLocaleString()}`,
          'Outstanding': `KES ${((fee.amount || 0) - (fee.paid_amount || 0)).toLocaleString()}`,
          'Status': fee.status || 'pending',
          'Due Date': fee.due_date || 'N/A',
          'Payment Method': fee.payment_method || 'N/A',
          'Transaction Reference': fee.transaction_reference || 'N/A'
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
          reportTitle = `Financial Report - ${schoolInfo?.name || 'Selected School'} - ${term}`;
        } else {
          reportTitle = `Financial Report - All Schools - ${term}`;
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

  // Create comprehensive school header information
  const schoolHeader = schoolInfo ? {
    "SCHOOL INFORMATION": "",
    "School Name": schoolInfo.name || "N/A",
    "Registration Number": schoolInfo.registration_number || "N/A",
    "Location": schoolInfo.location || "N/A",
    "Address": schoolInfo.address || "N/A",
    "Phone": schoolInfo.phone || "N/A",
    "Email": schoolInfo.email || "N/A",
    "Website": schoolInfo.website_url || "N/A",
    "Motto": schoolInfo.motto || "N/A",
    "Slogan": schoolInfo.slogan || "N/A",
    "Principal": schoolInfo.principal_name || "N/A",
    "Principal Contact": schoolInfo.principal_contact || "N/A",
    "": "",
    "REPORT DETAILS": "",
    "Report Title": reportTitle,
    "Academic Term": term,
    "Generated Date": new Date().toLocaleDateString(),
    "Generated Time": new Date().toLocaleTimeString(),
    "Generated By": `${role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}`,
    "Total Records": resultRows.length.toString(),
    "Report Status": hasError ? `Error: ${errorMessage}` : "Successfully Generated",
    " ": "",
    "ACADEMIC DATA": ""
  } : {
    "REPORT DETAILS": "",
    "Report Title": reportTitle,
    "Academic Term": term,
    "Generated Date": new Date().toLocaleDateString(),
    "Generated Time": new Date().toLocaleTimeString(),
    "Generated By": `${role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}`,
    "Total Records": resultRows.length.toString(),
    "Report Status": hasError ? `Error: ${errorMessage}` : "Successfully Generated",
    "": "",
    "ACADEMIC DATA": ""
  };

  // Build Excel file with proper structure
  try {
    // Create worksheet data with school header at top, then data
    const worksheetData = [
      schoolHeader,
      {}, // Empty row for separation
      ...resultRows
    ];

    const sheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: false });
    
    // Set column widths for better readability
    const maxCols = Math.max(
      Object.keys(schoolHeader).length,
      resultRows.length > 0 ? Object.keys(resultRows[0]).length : 0
    );
    
    const colWidths = Array(maxCols).fill(0).map(() => ({ wch: 20 }));
    sheet['!cols'] = colWidths;
    
    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Report");
    
    const xlsxData = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    if (!xlsxData || xlsxData.length === 0) {
      throw new Error("Failed to generate Excel data");
    }

    const filename = `${schoolInfo?.name || 'School'}_${reportTitle.replace(/[^a-zA-Z0-9]/g,"_")}_${term}_${new Date().toISOString().split('T')[0]}.xlsx`;

    console.log(`Report generated successfully: ${filename}, ${xlsxData.length} bytes, ${resultRows.length} records`);

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
