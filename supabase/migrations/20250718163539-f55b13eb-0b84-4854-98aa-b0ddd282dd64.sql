-- 20250110000004-fix-admin-authentication-setup.sql
-- Fix admin authentication setup issues

-- Ensure admin_role enum exists with all necessary values
DO $$ 
BEGIN
    -- Create admin_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM (
            'super_admin',
            'engineer', 
            'support_hr',
            'marketing_sales',
            'finance',
            'edufam_admin'
        );
    END IF;
    
    -- Add missing enum values if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'edufam_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'edufam_admin';
    END IF;
END $$;

-- Ensure admin_users table exists (referenced in other migrations)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role admin_role NOT NULL,
    app_type TEXT NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES public.admin_users(id)
);

-- Enable RLS if not already enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create necessary functions for authentication
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND is_active = true
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_edufam_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- First check admin_users table
    IF EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'edufam_admin') 
        AND is_active = true
    ) THEN
        RETURN true;
    END IF;
    
    -- Fallback to profiles table for backward compatibility
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'edufam_admin'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;