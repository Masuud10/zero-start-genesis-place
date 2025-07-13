-- Create admin_communications table
CREATE TABLE IF NOT EXISTS admin_communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    target_roles TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    dismissible BOOLEAN DEFAULT true
);

-- Create user_dismissed_communications table
CREATE TABLE IF NOT EXISTS user_dismissed_communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    communication_id UUID NOT NULL REFERENCES admin_communications(id) ON DELETE CASCADE,
    dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, communication_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_communications_active ON admin_communications(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_communications_target_roles ON admin_communications USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_admin_communications_expires_at ON admin_communications(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_communications_created_at ON admin_communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_dismissed_communications_user_id ON user_dismissed_communications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dismissed_communications_communication_id ON user_dismissed_communications(communication_id);

-- Enable Row Level Security
ALTER TABLE admin_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dismissed_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_communications
-- Allow all authenticated users to read active communications
CREATE POLICY "Allow read active communications" ON admin_communications
    FOR SELECT USING (is_active = true);

-- Allow EduFam admins to perform all operations
CREATE POLICY "Allow EduFam admins full access" ON admin_communications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'edufam_admin'
        )
    );

-- RLS Policies for user_dismissed_communications
-- Allow users to read their own dismissed communications
CREATE POLICY "Allow users read own dismissed communications" ON user_dismissed_communications
    FOR SELECT USING (user_id = auth.uid());

-- Allow users to insert their own dismissed communications
CREATE POLICY "Allow users insert own dismissed communications" ON user_dismissed_communications
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow EduFam admins to read all dismissed communications
CREATE POLICY "Allow EduFam admins read all dismissed communications" ON user_dismissed_communications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'edufam_admin'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for admin_communications
CREATE TRIGGER update_admin_communications_updated_at 
    BEFORE UPDATE ON admin_communications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired communications
CREATE OR REPLACE FUNCTION cleanup_expired_communications()
RETURNS void AS $$
BEGIN
    UPDATE admin_communications 
    SET is_active = false 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;