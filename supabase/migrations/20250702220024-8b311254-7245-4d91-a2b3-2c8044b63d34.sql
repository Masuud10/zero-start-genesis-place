-- Business Logic Functions for Payment and Grade Processing

-- Function to update fee payment balance atomically
CREATE OR REPLACE FUNCTION update_fee_payment(
  p_fee_id UUID,
  p_payment_amount NUMERIC
) RETURNS VOID AS $$
DECLARE
  v_current_paid NUMERIC;
  v_fee_amount NUMERIC;
  v_new_paid NUMERIC;
  v_new_status TEXT;
BEGIN
  -- Get current fee details
  SELECT paid_amount, amount INTO v_current_paid, v_fee_amount
  FROM fees 
  WHERE id = p_fee_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fee record not found with ID: %', p_fee_id;
  END IF;
  
  -- Calculate new paid amount
  v_new_paid := COALESCE(v_current_paid, 0) + p_payment_amount;
  
  -- Determine new status
  IF v_new_paid >= v_fee_amount THEN
    v_new_status := 'paid';
  ELSIF v_new_paid > 0 THEN
    v_new_status := 'partial';
  ELSE
    v_new_status := 'pending';
  END IF;
  
  -- Update fee record
  UPDATE fees 
  SET 
    paid_amount = v_new_paid,
    status = v_new_status,
    paid_date = CASE WHEN v_new_status = 'paid' THEN CURRENT_DATE ELSE paid_date END,
    updated_at = NOW()
  WHERE id = p_fee_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate grade statistics for a class
CREATE OR REPLACE FUNCTION calculate_class_grade_stats(
  p_class_id UUID,
  p_term TEXT,
  p_exam_type TEXT
) RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_students', COUNT(DISTINCT student_id),
    'graded_students', COUNT(DISTINCT CASE WHEN score IS NOT NULL THEN student_id END),
    'average_score', ROUND(AVG(CASE WHEN score IS NOT NULL THEN percentage END), 2),
    'highest_score', MAX(percentage),
    'lowest_score', MIN(CASE WHEN score IS NOT NULL THEN percentage END),
    'pass_rate', ROUND(
      (COUNT(CASE WHEN percentage >= 50 THEN 1 END) * 100.0) / 
      NULLIF(COUNT(CASE WHEN score IS NOT NULL THEN 1 END), 0), 2
    )
  ) INTO v_stats
  FROM grades 
  WHERE class_id = p_class_id 
    AND term = p_term 
    AND exam_type = p_exam_type
    AND status IN ('approved', 'released');
    
  RETURN COALESCE(v_stats, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate business rules before grade submission
CREATE OR REPLACE FUNCTION validate_grade_submission(
  p_student_id UUID,
  p_subject_id UUID,
  p_class_id UUID,
  p_term TEXT,
  p_exam_type TEXT,
  p_score NUMERIC,
  p_max_score NUMERIC
) RETURNS TEXT AS $$
DECLARE
  v_student_class_id UUID;
  v_subject_class_id UUID;
BEGIN
  -- Verify student belongs to the class
  SELECT class_id INTO v_student_class_id
  FROM students 
  WHERE id = p_student_id AND is_active = true;
  
  IF v_student_class_id != p_class_id THEN
    RETURN 'Student does not belong to the specified class';
  END IF;
  
  -- Verify subject belongs to the class
  SELECT class_id INTO v_subject_class_id
  FROM subjects 
  WHERE id = p_subject_id AND is_active = true;
  
  IF v_subject_class_id != p_class_id THEN
    RETURN 'Subject does not belong to the specified class';
  END IF;
  
  -- Validate score ranges
  IF p_score IS NOT NULL AND p_score < 0 THEN
    RETURN 'Score cannot be negative';
  END IF;
  
  IF p_score IS NOT NULL AND p_max_score IS NOT NULL AND p_score > p_max_score THEN
    RETURN 'Score cannot exceed maximum score';
  END IF;
  
  RETURN 'valid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;