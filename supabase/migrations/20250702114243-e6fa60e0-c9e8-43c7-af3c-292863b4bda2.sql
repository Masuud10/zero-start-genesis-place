-- Fix Security Definer Views - Change to Security Invoker
-- This ensures views enforce RLS policies of the querying user, not the creator

-- Change comprehensive_report_data view to SECURITY INVOKER
ALTER VIEW public.comprehensive_report_data SET (security_invoker = true);

-- Change school_attendance_summary view to SECURITY INVOKER  
ALTER VIEW public.school_attendance_summary SET (security_invoker = true);

-- Change school_finance_summary view to SECURITY INVOKER
ALTER VIEW public.school_finance_summary SET (security_invoker = true);

-- Change school_grades_summary view to SECURITY INVOKER
ALTER VIEW public.school_grades_summary SET (security_invoker = true);