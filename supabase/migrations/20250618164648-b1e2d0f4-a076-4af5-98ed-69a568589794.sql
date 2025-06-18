
-- First, let's ensure proper RLS policies for finance-related tables
-- Update RLS policies for expenses table
DROP POLICY IF EXISTS "Users can view expenses in their school" ON public.expenses;
CREATE POLICY "Users can view expenses in their school" 
  ON public.expenses 
  FOR SELECT 
  USING (
    CASE 
      WHEN public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') THEN true
      ELSE school_id = public.get_current_user_school_id()
    END
  );

DROP POLICY IF EXISTS "Finance officers can create expenses" ON public.expenses;
CREATE POLICY "Finance officers can create expenses" 
  ON public.expenses 
  FOR INSERT 
  WITH CHECK (
    public.get_current_user_role() IN ('finance_officer', 'principal', 'school_owner', 'elimisha_admin', 'edufam_admin')
    AND (
      public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') 
      OR school_id = public.get_current_user_school_id()
    )
  );

-- Update RLS policies for financial_transactions table
DROP POLICY IF EXISTS "Users can view transactions in their school" ON public.financial_transactions;
CREATE POLICY "Users can view transactions in their school" 
  ON public.financial_transactions 
  FOR SELECT 
  USING (
    CASE 
      WHEN public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') THEN true
      ELSE school_id = public.get_current_user_school_id()
    END
  );

DROP POLICY IF EXISTS "Finance officers can create transactions" ON public.financial_transactions;
CREATE POLICY "Finance officers can create transactions" 
  ON public.financial_transactions 
  FOR INSERT 
  WITH CHECK (
    public.get_current_user_role() IN ('finance_officer', 'principal', 'school_owner', 'elimisha_admin', 'edufam_admin')
    AND (
      public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') 
      OR school_id = public.get_current_user_school_id()
    )
  );

-- Update RLS policies for student_fees table
DROP POLICY IF EXISTS "Users can view student fees in their school" ON public.student_fees;
CREATE POLICY "Users can view student fees in their school" 
  ON public.student_fees 
  FOR SELECT 
  USING (
    CASE 
      WHEN public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') THEN true
      WHEN public.get_current_user_role() = 'parent' THEN 
        EXISTS (
          SELECT 1 FROM public.parent_students ps 
          WHERE ps.parent_id = auth.uid() AND ps.student_id = student_fees.student_id
        )
      ELSE school_id = public.get_current_user_school_id()
    END
  );

-- Update RLS policies for fees table
DROP POLICY IF EXISTS "Users can view fees in their school" ON public.fees;
CREATE POLICY "Users can view fees in their school" 
  ON public.fees 
  FOR SELECT 
  USING (
    CASE 
      WHEN public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') THEN true
      WHEN public.get_current_user_role() = 'parent' THEN 
        EXISTS (
          SELECT 1 FROM public.parent_students ps 
          WHERE ps.parent_id = auth.uid() AND ps.student_id = fees.student_id
        )
      ELSE school_id = public.get_current_user_school_id()
    END
  );

-- Create function to generate financial reports for finance officers
CREATE OR REPLACE FUNCTION public.generate_finance_report(
  p_report_type text,
  p_school_id uuid DEFAULT NULL,
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
  user_role text;
  user_school_id uuid;
  report_data jsonb;
  school_data jsonb;
  student_data jsonb;
  class_data jsonb;
BEGIN
  -- Get user role and school
  SELECT role, school_id INTO user_role, user_school_id
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Only allow finance officers, principals, and admins to generate reports
  IF user_role NOT IN ('finance_officer', 'principal', 'school_owner', 'elimisha_admin', 'edufam_admin') THEN
    RETURN jsonb_build_object('error', 'Insufficient permissions to generate financial reports');
  END IF;
  
  -- Enforce school isolation for non-admin users
  IF user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    IF p_school_id IS NOT NULL AND p_school_id != user_school_id THEN
      RETURN jsonb_build_object('error', 'Cannot generate reports for other schools');
    END IF;
    p_school_id := user_school_id;
  END IF;
  
  -- Get school information
  SELECT jsonb_build_object(
    'id', id,
    'name', name,
    'location', location,
    'address', address,
    'phone', phone,
    'email', email,
    'logo_url', logo_url
  ) INTO school_data
  FROM public.schools
  WHERE id = p_school_id;
  
  IF p_report_type = 'individual_student' THEN
    -- Generate individual student financial report
    SELECT jsonb_build_object(
      'student_info', jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'admission_number', s.admission_number,
        'class', c.name
      ),
      'fees_summary', (
        SELECT jsonb_build_object(
          'total_fees', COALESCE(SUM(f.amount), 0),
          'total_paid', COALESCE(SUM(f.paid_amount), 0),
          'outstanding', COALESCE(SUM(f.amount - f.paid_amount), 0),
          'fees_breakdown', jsonb_agg(
            jsonb_build_object(
              'category', f.category,
              'term', f.term,
              'amount', f.amount,
              'paid_amount', f.paid_amount,
              'status', f.status,
              'due_date', f.due_date
            )
          )
        )
        FROM public.fees f
        WHERE f.student_id = p_student_id
        AND f.school_id = p_school_id
        AND (p_academic_year IS NULL OR f.academic_year = p_academic_year)
        AND (p_term IS NULL OR f.term = p_term)
      ),
      'transactions', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'date', ft.processed_at,
            'amount', ft.amount,
            'payment_method', ft.payment_method,
            'reference', ft.reference_number,
            'mpesa_code', ft.mpesa_code
          )
        )
        FROM public.financial_transactions ft
        WHERE ft.student_id = p_student_id
        AND ft.school_id = p_school_id
        AND (p_academic_year IS NULL OR ft.academic_year = p_academic_year)
      )
    ) INTO report_data
    FROM public.students s
    LEFT JOIN public.classes c ON s.class_id = c.id
    WHERE s.id = p_student_id AND s.school_id = p_school_id;
    
  ELSIF p_report_type = 'class_financial' THEN
    -- Generate class financial report
    SELECT jsonb_build_object(
      'class_info', jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'level', c.level,
        'stream', c.stream,
        'total_students', (
          SELECT COUNT(*) FROM public.students s 
          WHERE s.class_id = c.id AND s.is_active = true
        )
      ),
      'financial_summary', (
        SELECT jsonb_build_object(
          'total_fees', COALESCE(SUM(f.amount), 0),
          'total_collected', COALESCE(SUM(f.paid_amount), 0),
          'total_outstanding', COALESCE(SUM(f.amount - f.paid_amount), 0),
          'collection_rate', 
          CASE 
            WHEN SUM(f.amount) > 0 THEN 
              ROUND((SUM(f.paid_amount) / SUM(f.amount)) * 100, 2)
            ELSE 0 
          END,
          'payment_methods_breakdown', (
            SELECT jsonb_object_agg(
              payment_method,
              jsonb_build_object(
                'count', count,
                'total_amount', total_amount
              )
            )
            FROM (
              SELECT 
                ft.payment_method,
                COUNT(*) as count,
                SUM(ft.amount) as total_amount
              FROM public.financial_transactions ft
              JOIN public.students s ON ft.student_id = s.id
              WHERE s.class_id = p_class_id
              AND ft.school_id = p_school_id
              GROUP BY ft.payment_method
            ) pm
          )
        )
        FROM public.fees f
        JOIN public.students s ON f.student_id = s.id
        WHERE s.class_id = p_class_id
        AND f.school_id = p_school_id
        AND (p_academic_year IS NULL OR f.academic_year = p_academic_year)
        AND (p_term IS NULL OR f.term = p_term)
      )
    ) INTO report_data
    FROM public.classes c
    WHERE c.id = p_class_id AND c.school_id = p_school_id;
    
  ELSIF p_report_type = 'school_financial' THEN
    -- Generate school-wide financial report
    SELECT jsonb_build_object(
      'financial_overview', jsonb_build_object(
        'total_fees', COALESCE(SUM(f.amount), 0),
        'total_collected', COALESCE(SUM(f.paid_amount), 0),
        'total_outstanding', COALESCE(SUM(f.amount - f.paid_amount), 0),
        'collection_rate', 
        CASE 
          WHEN SUM(f.amount) > 0 THEN 
            ROUND((SUM(f.paid_amount) / SUM(f.amount)) * 100, 2)
          ELSE 0 
        END
      ),
      'expenses_summary', (
        SELECT jsonb_build_object(
          'total_expenses', COALESCE(SUM(amount), 0),
          'expenses_by_category', jsonb_object_agg(category, category_total)
        )
        FROM (
          SELECT category, SUM(amount) as category_total
          FROM public.expenses
          WHERE school_id = p_school_id
          AND (p_academic_year IS NULL OR EXTRACT(year FROM date)::text = p_academic_year)
          GROUP BY category
        ) e
      ),
      'payment_methods', (
        SELECT jsonb_object_agg(
          payment_method,
          jsonb_build_object(
            'count', count,
            'total_amount', total_amount
          )
        )
        FROM (
          SELECT 
            payment_method,
            COUNT(*) as count,
            SUM(amount) as total_amount
          FROM public.financial_transactions
          WHERE school_id = p_school_id
          AND (p_academic_year IS NULL OR academic_year = p_academic_year)
          GROUP BY payment_method
        ) pm
      ),
      'class_breakdown', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'class_name', c.name,
            'total_fees', class_fees.total_fees,
            'collected', class_fees.collected,
            'outstanding', class_fees.outstanding,
            'collection_rate', class_fees.collection_rate
          )
        )
        FROM public.classes c
        LEFT JOIN (
          SELECT 
            s.class_id,
            SUM(f.amount) as total_fees,
            SUM(f.paid_amount) as collected,
            SUM(f.amount - f.paid_amount) as outstanding,
            CASE 
              WHEN SUM(f.amount) > 0 THEN 
                ROUND((SUM(f.paid_amount) / SUM(f.amount)) * 100, 2)
              ELSE 0 
            END as collection_rate
          FROM public.fees f
          JOIN public.students s ON f.student_id = s.id
          WHERE f.school_id = p_school_id
          GROUP BY s.class_id
        ) class_fees ON c.id = class_fees.class_id
        WHERE c.school_id = p_school_id
      )
    ) INTO report_data
    FROM public.fees f
    WHERE f.school_id = p_school_id
    AND (p_academic_year IS NULL OR f.academic_year = p_academic_year)
    AND (p_term IS NULL OR f.term = p_term);
    
  ELSE
    RETURN jsonb_build_object('error', 'Invalid report type');
  END IF;
  
  -- Combine school info with report data
  RETURN jsonb_build_object(
    'school', school_data,
    'report_type', p_report_type,
    'generated_at', NOW(),
    'academic_year', p_academic_year,
    'term', p_term,
    'data', report_data
  );
END;
$$;

-- Create function to record fee payments with different methods
CREATE OR REPLACE FUNCTION public.record_fee_payment(
  p_student_fee_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_reference_number text DEFAULT NULL,
  p_mpesa_code text DEFAULT NULL,
  p_bank_reference text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  user_school_id uuid;
  fee_record RECORD;
  new_status text;
  transaction_id uuid;
BEGIN
  -- Get user role and school
  SELECT role, school_id INTO user_role, user_school_id
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Only allow finance officers, principals, and admins
  IF user_role NOT IN ('finance_officer', 'principal', 'school_owner', 'elimisha_admin', 'edufam_admin') THEN
    RETURN jsonb_build_object('error', 'Insufficient permissions to record payments');
  END IF;
  
  -- Get fee record with school validation
  SELECT sf.*, f.amount as fee_amount, sf.school_id
  INTO fee_record
  FROM public.student_fees sf
  JOIN public.fees f ON sf.fee_id = f.id
  WHERE sf.id = p_student_fee_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Fee record not found');
  END IF;
  
  -- Enforce school isolation
  IF user_role NOT IN ('elimisha_admin', 'edufam_admin') AND fee_record.school_id != user_school_id THEN
    RETURN jsonb_build_object('error', 'Cannot record payments for other schools');
  END IF;
  
  -- Validate payment method
  IF p_payment_method NOT IN ('mpesa', 'cash', 'bank_transfer', 'card', 'cheque') THEN
    RETURN jsonb_build_object('error', 'Invalid payment method');
  END IF;
  
  -- Calculate new total paid amount
  DECLARE
    new_total_paid numeric := fee_record.amount_paid + p_amount;
  BEGIN
    -- Determine new status
    IF new_total_paid >= fee_record.fee_amount THEN
      new_status := 'paid';
    ELSIF new_total_paid > 0 THEN
      new_status := 'partial';
    ELSE
      new_status := 'unpaid';
    END IF;
    
    -- Update student fee record
    UPDATE public.student_fees
    SET 
      amount_paid = new_total_paid,
      status = new_status,
      updated_at = NOW()
    WHERE id = p_student_fee_id;
    
    -- Create financial transaction record
    INSERT INTO public.financial_transactions (
      school_id,
      student_id,
      fee_id,
      transaction_type,
      amount,
      payment_method,
      reference_number,
      mpesa_code,
      bank_reference,
      processed_by,
      processed_at
    ) VALUES (
      fee_record.school_id,
      fee_record.student_id,
      fee_record.fee_id,
      'payment',
      p_amount,
      p_payment_method,
      p_reference_number,
      p_mpesa_code,
      p_bank_reference,
      auth.uid(),
      NOW()
    ) RETURNING id INTO transaction_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'transaction_id', transaction_id,
      'new_status', new_status,
      'total_paid', new_total_paid,
      'remaining_amount', GREATEST(0, fee_record.fee_amount - new_total_paid)
    );
  END;
END;
$$;
