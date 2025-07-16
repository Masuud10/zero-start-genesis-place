-- Fix NULL values in auth.users table that are causing scan errors
-- This addresses the "Database error querying schema" issue for HR login

-- Update NULL values to empty strings for columns that cause scan errors
UPDATE auth.users 
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  phone_change = COALESCE(phone_change, '')
WHERE 
  confirmation_token IS NULL 
  OR email_change IS NULL 
  OR email_change_token_new IS NULL 
  OR phone_change IS NULL;

-- Also ensure the HR user has proper password setup
UPDATE auth.users 
SET 
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'hr@edufam.com' AND encrypted_password IS NULL;