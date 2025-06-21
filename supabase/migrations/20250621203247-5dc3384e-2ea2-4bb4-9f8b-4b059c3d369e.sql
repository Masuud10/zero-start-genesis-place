
-- Drop the existing function first, then recreate it
DROP FUNCTION IF EXISTS generate_finance_report(text, uuid, uuid, uuid, text, text);

-- Now create the function with the correct signature
CREATE OR REPLACE FUNCTION generate_finance_report(
  p_report_type text,
  p_school_id uuid,
  p_class_id uuid DEFAULT NULL,
  p_student_id uuid DEFAULT NULL,
  p_academic_year text DEFAULT NULL,
  p_term text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  IF p_report_type = 'school_financial' THEN
    -- School financial report
    SELECT jsonb_build_object(
      'report_type', 'school_financial',
      'school_id', p_school_id,
      'academic_year', p_academic_year,
      'term', p_term,
      'generated_at', now(),
      'summary', (
        SELECT jsonb_build_object(
          'total_fees', COALESCE(SUM(f.amount), 0),
          'total_collected', COALESCE(SUM(f.paid_amount), 0),
          'outstanding', COALESCE(SUM(f.amount - f.paid_amount), 0),
          'collection_rate', 
            CASE WHEN SUM(f.amount) > 0 
            THEN ROUND((SUM(f.paid_amount) / SUM(f.amount)) * 100, 2)
            ELSE 0 END
        )
        FROM public.fees f
        WHERE f.school_id = p_school_id
        AND (p_academic_year IS NULL OR f.academic_year = p_academic_year)
        AND (p_term IS NULL OR f.term = p_term)
      ),
      'expenses', (
        SELECT jsonb_build_object(
          'total_expenses', COALESCE(SUM(e.amount), 0),
          'expense_breakdown', jsonb_agg(
            jsonb_build_object(
              'category', e.category,
              'amount', e.amount,
              'date', e.date
            )
          )
        )
        FROM public.expenses e
        WHERE e.school_id = p_school_id
      )
    ) INTO result;
    
  ELSIF p_report_type = 'class_financial' THEN
    -- Class financial breakdown
    SELECT jsonb_build_object(
      'report_type', 'class_financial',
      'generated_at', now(),
      'class_breakdown', jsonb_agg(
        jsonb_build_object(
          'class_id', c.id,
          'class_name', c.name,
          'total_fees', class_totals.total_fees,
          'collected', class_totals.collected,
          'outstanding', class_totals.outstanding,
          'student_count', class_totals.student_count
        )
      )
    )
    FROM public.classes c
    LEFT JOIN (
      SELECT 
        f.class_id,
        SUM(f.amount) as total_fees,
        SUM(f.paid_amount) as collected,
        SUM(f.amount - f.paid_amount) as outstanding,
        COUNT(DISTINCT f.student_id) as student_count
      FROM public.fees f
      WHERE f.school_id = p_school_id
      AND (p_academic_year IS NULL OR f.academic_year = p_academic_year)
      AND (p_term IS NULL OR f.term = p_term)
      GROUP BY f.class_id
    ) class_totals ON c.id = class_totals.class_id
    WHERE c.school_id = p_school_id
    INTO result;
    
  END IF;
  
  RETURN result;
END;
$$;
