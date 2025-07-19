-- Fix missing functions and add RLS policies for tables without policies

-- Create the missing is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- Create the missing is_edufam_admin function
CREATE OR REPLACE FUNCTION public.is_edufam_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'edufam_admin'
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_edufam_admin() TO authenticated;

-- Add missing RLS policies for tables that have RLS enabled but no policies

-- Add policy for announcements if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'announcements' 
        AND policyname = 'Basic announcements access'
    ) THEN
        CREATE POLICY "Basic announcements access" 
        ON public.announcements 
        FOR ALL 
        USING (true);
    END IF;
END $$;

-- Add basic policies for any other tables that need them
-- We'll start with a permissive policy and then can make them more restrictive

DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Find tables with RLS enabled but no policies
    FOR table_record IN
        SELECT t.tablename
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        WHERE t.schemaname = 'public'
        AND c.relrowsecurity = true
        AND NOT EXISTS (
            SELECT 1 FROM pg_policies p 
            WHERE p.schemaname = 'public' 
            AND p.tablename = t.tablename
        )
    LOOP
        -- Create a basic policy for each table
        EXECUTE format('CREATE POLICY "Allow authenticated users" ON public.%I FOR ALL USING (auth.uid() IS NOT NULL)', table_record.tablename);
        RAISE NOTICE 'Created basic policy for table: %', table_record.tablename;
    END LOOP;
END $$;