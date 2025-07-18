-- 20250719000001-complete-database-integrity-fix.sql
-- Complete database integrity fixes and constraint validation

-- Fix any orphaned references and ensure data integrity
-- Clean up any invalid foreign key references in admin_users
UPDATE public.admin_users 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND created_by NOT IN (SELECT id FROM public.admin_users);

-- Ensure all admin_users have valid user_id references
DELETE FROM public.admin_users 
WHERE user_id IS NOT NULL 
AND user_id NOT IN (SELECT id FROM auth.users);

-- Create missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON public.admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user_id ON public.admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_timestamp ON public.admin_audit_logs(timestamp);

-- Ensure proper constraints exist
ALTER TABLE public.admin_users 
DROP CONSTRAINT IF EXISTS admin_users_email_check;

ALTER TABLE public.admin_users 
ADD CONSTRAINT admin_users_email_check 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add constraint to ensure app_type is valid
ALTER TABLE public.admin_users 
DROP CONSTRAINT IF EXISTS admin_users_app_type_check;

ALTER TABLE public.admin_users 
ADD CONSTRAINT admin_users_app_type_check 
CHECK (app_type IN ('admin', 'school', 'system'));

-- Ensure audit logs have valid data
DELETE FROM public.admin_audit_logs 
WHERE admin_user_id IS NOT NULL 
AND admin_user_id NOT IN (SELECT id FROM public.admin_users);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_users_updated_at ON public.admin_users;
CREATE TRIGGER admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_admin_updated_at();

-- Validate data consistency
DO $$
DECLARE
    orphaned_count INTEGER;
    duplicate_count INTEGER;
BEGIN
    -- Check for orphaned admin audit logs
    SELECT COUNT(*) INTO orphaned_count
    FROM public.admin_audit_logs 
    WHERE admin_user_id IS NOT NULL 
    AND admin_user_id NOT IN (SELECT id FROM public.admin_users);
    
    IF orphaned_count > 0 THEN
        RAISE NOTICE 'Found % orphaned audit log records', orphaned_count;
    END IF;
    
    -- Check for duplicate admin users by email
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT email, COUNT(*) as cnt
        FROM public.admin_users 
        GROUP BY email 
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Found % duplicate admin user emails', duplicate_count;
    END IF;
    
    RAISE NOTICE 'Database integrity check completed';
END $$;