-- Table to store customizable certificate templates
CREATE TABLE public.certificate_templates (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    template_name TEXT NOT NULL, -- e.g., "Academic Excellence Award"
    template_type TEXT NOT NULL, -- 'academic', 'extracurricular', 'leadership'

    -- Customizable Text Fields (with placeholders)
    title_text TEXT NOT NULL DEFAULT 'Certificate of Achievement',
    body_text TEXT NOT NULL DEFAULT 'This certificate is proudly presented to {{student_name}} for {{reason}}.',
    signature_1_name TEXT NOT NULL DEFAULT 'Principal''s Name',
    signature_2_name TEXT NOT NULL DEFAULT 'Teacher''s Name',

    -- Customizable Design Elements stored as JSON
    layout_config JSONB NOT NULL DEFAULT '{
        "font_family": "serif",
        "border_style": "classic",
        "background_color": "#FFFFFF",
        "seal_image_url": null
    }',

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add necessary indexes and RLS
CREATE INDEX idx_certificate_templates_school_id ON public.certificate_templates(school_id);
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for school-based access
CREATE POLICY "Allow access based on school_id" ON public.certificate_templates 
FOR ALL 
USING (school_id = get_current_user_school_id() OR get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin']))
WITH CHECK (school_id = get_current_user_school_id() OR get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin']));