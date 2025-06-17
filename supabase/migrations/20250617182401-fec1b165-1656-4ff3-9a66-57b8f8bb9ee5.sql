
-- Drop the views if they exist
DROP VIEW IF EXISTS public.school_grades_summary CASCADE;
DROP VIEW IF EXISTS public.school_attendance_summary CASCADE;
DROP VIEW IF EXISTS public.school_finance_summary CASCADE;

-- Recreate them WITHOUT SECURITY DEFINER (just plain views)
CREATE VIEW public.school_grades_summary AS
SELECT
  g.school_id,
  COUNT(g.id) AS grades_count,
  AVG(g.percentage) AS average_grade
FROM public.grades g
WHERE g.percentage IS NOT NULL
GROUP BY g.school_id;

CREATE VIEW public.school_attendance_summary AS
SELECT
  a.school_id,
  COUNT(a.id) AS attendance_count,
  AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100 AS attendance_rate
FROM public.attendance a
GROUP BY a.school_id;

CREATE VIEW public.school_finance_summary AS
SELECT
  f.school_id,
  SUM(f.amount) AS total_collected,
  COUNT(f.id) AS transactions_count
FROM public.financial_transactions f
WHERE f.transaction_type = 'fee_collection'
GROUP BY f.school_id;
