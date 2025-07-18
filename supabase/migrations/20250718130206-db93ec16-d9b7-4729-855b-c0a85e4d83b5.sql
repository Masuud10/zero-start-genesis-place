-- Step 1: Just add the edufam_admin enum value
-- This must be done in a separate transaction

DO $$ 
BEGIN
    -- Add edufam_admin to enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'edufam_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'edufam_admin';
        RAISE NOTICE 'Added edufam_admin to admin_role enum';
    ELSE
        RAISE NOTICE 'edufam_admin already exists in admin_role enum';
    END IF;
END $$;