-- Create admin roles enum
CREATE TYPE admin_role AS ENUM (
  'super_admin',
  'engineer', 
  'support_hr',
  'marketing_sales',
  'finance'
);

-- Create admin_users table for admin application users
CREATE TABLE public.admin_users (
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

-- Create audit_logs table for tracking admin actions
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
CREATE POLICY "Super admins can manage all admin users" 
ON public.admin_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
  )
);

CREATE POLICY "Admin users can view their own record" 
ON public.admin_users 
FOR SELECT 
USING (user_id = auth.uid());

-- RLS Policies for admin_audit_logs
CREATE POLICY "Super admins can view all audit logs" 
ON public.admin_audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
  )
);

CREATE POLICY "All admin users can create audit logs" 
ON public.admin_audit_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
  )
);

-- Create function to get current admin user role
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS admin_role AS $$
DECLARE
  user_role admin_role;
BEGIN
  SELECT role INTO user_role
  FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create function to check admin permissions
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_permissions JSONB;
  user_role admin_role;
BEGIN
  SELECT role, permissions INTO user_role, user_permissions
  FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  -- Super admin has all permissions
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check specific permission
  RETURN COALESCE((user_permissions->permission_name)::boolean, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_updated_at();

-- Insert initial super admin (migrate existing edufam_admin)
INSERT INTO public.admin_users (user_id, email, name, role, app_type, is_active)
SELECT 
  p.id,
  p.email,
  p.name,
  'super_admin',
  'admin',
  true
FROM public.profiles p
WHERE p.role = 'edufam_admin' AND p.id IS NOT NULL
ON CONFLICT (email) DO NOTHING;