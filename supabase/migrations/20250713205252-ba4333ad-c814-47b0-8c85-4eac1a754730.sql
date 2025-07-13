-- Fix the RLS policy for admin_communications table
-- The policy was referencing 'user_profiles' but the actual table name is 'profiles'

-- Drop the incorrect policies
DROP POLICY IF EXISTS "Allow EduFam admins full access" ON admin_communications;
DROP POLICY IF EXISTS "Allow EduFam admins read all dismissed communications" ON user_dismissed_communications;

-- Recreate the policies with the correct table name
CREATE POLICY "Allow EduFam admins full access" ON admin_communications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'edufam_admin'
        )
    );

-- Fix the dismissed communications policy as well
CREATE POLICY "Allow EduFam admins read all dismissed communications" ON user_dismissed_communications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'edufam_admin'
        )
    );