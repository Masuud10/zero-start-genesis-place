-- Step 1: Create the enum type first
DO $$ 
BEGIN
    -- Create admin_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM (
            'super_admin',
            'edufam_admin',
            'software_engineer', 
            'support_hr',
            'sales_marketing',
            'finance'
        );
    END IF;
END $$;