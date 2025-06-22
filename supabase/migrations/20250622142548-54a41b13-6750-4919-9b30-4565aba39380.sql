
-- Create system_settings table for maintenance control
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Insert default maintenance mode setting
INSERT INTO public.system_settings (setting_key, setting_value)
VALUES ('maintenance_mode', '{"enabled": false, "message": "System is currently under maintenance. Please try again later.", "updated_at": "2024-01-01T00:00:00Z"}')
ON CONFLICT (setting_key) DO NOTHING;

-- Add RLS policies for system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only EduFam admins can access system settings" 
  ON public.system_settings 
  FOR ALL 
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'edufam_admin');

-- Create enhanced school creation function
CREATE OR REPLACE FUNCTION public.create_enhanced_school(
  school_name text,
  school_email text,
  school_phone text,
  school_address text,
  logo_url text DEFAULT NULL,
  website_url text DEFAULT NULL,
  motto text DEFAULT NULL,
  slogan text DEFAULT NULL,
  school_type text DEFAULT 'primary',
  registration_number text DEFAULT NULL,
  year_established integer DEFAULT NULL,
  term_structure text DEFAULT '3-term',
  owner_information text DEFAULT NULL,
  owner_email text DEFAULT NULL,
  owner_name text DEFAULT NULL,
  owner_phone text DEFAULT NULL,
  curriculum_type text DEFAULT 'cbc'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_school_id uuid;
  current_user_role text;
  owner_user_id uuid;
  create_user_result jsonb;
BEGIN
  -- Check if current user is edufam_admin
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF current_user_role != 'edufam_admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only EduFam Admin can create schools');
  END IF;

  -- Check if school name already exists
  IF EXISTS (SELECT 1 FROM public.schools WHERE name = school_name) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this name already exists');
  END IF;

  -- Check if registration number already exists (if provided)
  IF registration_number IS NOT NULL AND EXISTS (SELECT 1 FROM public.schools WHERE registration_number = registration_number) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this registration number already exists');
  END IF;

  -- Create the school
  INSERT INTO public.schools (
    name, email, phone, address, logo_url, website_url, motto, slogan,
    school_type, registration_number, year_established, term_structure,
    owner_information, curriculum_type, created_at, updated_at
  ) VALUES (
    school_name, school_email, school_phone, school_address, logo_url, website_url, motto, slogan,
    school_type, registration_number, year_established, term_structure,
    owner_information, curriculum_type, now(), now()
  ) RETURNING id INTO new_school_id;

  -- If owner details provided, create owner account
  IF owner_email IS NOT NULL AND owner_name IS NOT NULL THEN
    SELECT public.create_admin_user(
      owner_email, 
      'TempPassword123!', -- Temporary password
      owner_name, 
      'school_owner', 
      new_school_id
    ) INTO create_user_result;

    -- Extract user_id from result
    IF create_user_result->>'success' = 'true' THEN
      owner_user_id := (create_user_result->>'user_id')::uuid;
      
      -- Update school with owner_id
      UPDATE public.schools 
      SET owner_id = owner_user_id 
      WHERE id = new_school_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'school_id', new_school_id,
    'owner_id', owner_user_id,
    'message', 'School created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_enhanced_school error: %', SQLERRM;
  RETURN jsonb_build_object('success', false, 'error', 'Failed to create school: ' || SQLERRM);
END;
$$;

-- Add status column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
    ALTER TABLE public.profiles ADD COLUMN status text DEFAULT 'active';
  END IF;
END $$;

-- Create function to update user status
CREATE OR REPLACE FUNCTION public.update_user_status(
  target_user_id uuid,
  new_status text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_role text;
  target_user_role text;
  target_user_email text;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Get target user's role and email
  SELECT role, email INTO target_user_role, target_user_email
  FROM public.profiles 
  WHERE id = target_user_id;

  -- Only edufam_admin can update user status
  IF current_user_role != 'edufam_admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only EduFam Admin can update user status');
  END IF;

  -- Prevent deactivation of edufam_admin accounts
  IF target_user_role = 'edufam_admin' AND new_status = 'inactive' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot deactivate EduFam Admin accounts');
  END IF;

  -- Validate new status
  IF new_status NOT IN ('active', 'inactive') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid status. Must be active or inactive');
  END IF;

  -- Update user status
  UPDATE public.profiles 
  SET status = new_status, updated_at = now()
  WHERE id = target_user_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'User status updated successfully',
      'user_email', target_user_email,
      'new_status', new_status
    );
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'Failed to update user status: ' || SQLERRM);
END;
$$;
