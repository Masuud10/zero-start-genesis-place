
-- Create certificates table
CREATE TABLE public.certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year text NOT NULL,
    performance jsonb NOT NULL DEFAULT '{}',
    generated_by uuid NOT NULL REFERENCES public.profiles(id),
    generated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Ensure only one certificate per student per academic year per school
    UNIQUE(school_id, student_id, academic_year)
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for certificates table

-- Principals can generate and view certificates for their own school only
CREATE POLICY "Principals can manage certificates for their school" 
ON public.certificates 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'principal' 
        AND school_id = certificates.school_id
    )
) 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'principal' 
        AND school_id = certificates.school_id
    )
);

-- School owners can only view certificates for their own school
CREATE POLICY "School owners can view certificates for their school" 
ON public.certificates 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'school_owner' 
        AND school_id = certificates.school_id
    )
);

-- EduFam admins can manage all certificates
CREATE POLICY "EduFam admins can manage all certificates" 
ON public.certificates 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'edufam_admin'
    )
) 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'edufam_admin'
    )
);

-- Create indexes for performance
CREATE INDEX idx_certificates_school_year ON public.certificates(school_id, academic_year);
CREATE INDEX idx_certificates_student ON public.certificates(student_id);
CREATE INDEX idx_certificates_generated_by ON public.certificates(generated_by);

-- Create function to get student performance data for certificate
CREATE OR REPLACE FUNCTION public.get_student_certificate_data(
    p_student_id uuid,
    p_academic_year text,
    p_class_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    student_data jsonb;
    performance_data jsonb;
    attendance_data jsonb;
    result jsonb;
BEGIN
    -- Get student basic info
    SELECT jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'admission_number', s.admission_number,
        'roll_number', s.roll_number,
        'school_id', s.school_id
    )
    INTO student_data
    FROM public.students s
    WHERE s.id = p_student_id;
    
    -- Get performance summary for the academic year
    SELECT jsonb_build_object(
        'total_marks', COALESCE(SUM(g.score), 0),
        'possible_marks', COALESCE(SUM(g.max_score), 0),
        'average_score', COALESCE(AVG(g.percentage), 0),
        'grade_letter', mode() WITHIN GROUP (ORDER BY g.letter_grade),
        'total_subjects', COUNT(DISTINCT g.subject_id),
        'class_position', MIN(g.position),
        'subjects_performance', jsonb_agg(
            jsonb_build_object(
                'subject_name', sub.name,
                'subject_code', sub.code,
                'score', g.score,
                'max_score', g.max_score,
                'percentage', g.percentage,
                'grade', g.letter_grade
            )
        )
    )
    INTO performance_data
    FROM public.grades g
    JOIN public.subjects sub ON g.subject_id = sub.id
    WHERE g.student_id = p_student_id 
    AND g.class_id = p_class_id
    AND g.status = 'released'
    AND EXTRACT(year FROM g.created_at)::text = p_academic_year;
    
    -- Get attendance summary
    SELECT jsonb_build_object(
        'total_days', COUNT(*),
        'present_days', COUNT(CASE WHEN a.status = 'present' THEN 1 END),
        'absent_days', COUNT(CASE WHEN a.status = 'absent' THEN 1 END),
        'attendance_percentage', 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2)
            ELSE 0 
        END
    )
    INTO attendance_data
    FROM public.attendance a
    WHERE a.student_id = p_student_id 
    AND a.class_id = p_class_id
    AND a.academic_year = p_academic_year;
    
    -- Combine all data
    result := jsonb_build_object(
        'student', student_data,
        'performance', COALESCE(performance_data, '{}'),
        'attendance', COALESCE(attendance_data, '{}'),
        'academic_year', p_academic_year,
        'class_id', p_class_id
    );
    
    RETURN result;
END;
$$;
