-- Fix admin authentication with correct existing enum values
-- Add missing enum values to existing admin_role type
ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'edufam_admin';
ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'software_engineer';