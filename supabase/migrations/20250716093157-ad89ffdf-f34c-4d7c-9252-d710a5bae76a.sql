-- Update RLS policies for support_staff table to include school_director role

-- Drop existing policies
DROP POLICY IF EXISTS "School admins can view support staff in their school" ON support_staff;
DROP POLICY IF EXISTS "HR can manage support staff in their school" ON support_staff;
DROP POLICY IF EXISTS "System admins can manage all support staff" ON support_staff;

-- Create comprehensive RLS policies for support_staff
CREATE POLICY "System admins can manage all support staff"
ON support_staff
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['edufam_admin'::text, 'elimisha_admin'::text]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['edufam_admin'::text, 'elimisha_admin'::text]));

CREATE POLICY "HR can manage support staff in their school"
ON support_staff
FOR ALL
USING ((school_id = get_current_user_school_id()) AND (get_current_user_role() = 'hr'::text))
WITH CHECK ((school_id = get_current_user_school_id()) AND (get_current_user_role() = 'hr'::text));

CREATE POLICY "School admins can view and manage support staff in their school"
ON support_staff
FOR ALL
USING ((school_id = get_current_user_school_id()) AND (get_current_user_role() = ANY (ARRAY['principal'::text, 'school_director'::text, 'hr'::text])))
WITH CHECK ((school_id = get_current_user_school_id()) AND (get_current_user_role() = ANY (ARRAY['principal'::text, 'school_director'::text, 'hr'::text])));

-- Insert some sample support staff data for testing
INSERT INTO support_staff (
  school_id,
  employee_id,
  full_name,
  role_title,
  department,
  salary_amount,
  salary_currency,
  employment_type,
  phone,
  email,
  date_of_hire,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  (SELECT school_id FROM profiles WHERE role = 'hr' LIMIT 1),
  'SS-2024-0001',
  'John Doe',
  'Driver',
  'Transport',
  25000,
  'KES',
  'permanent',
  '+254700123456',
  'john.driver@school.com',
  '2024-01-15',
  true,
  NOW(),
  NOW()
),
(
  (SELECT school_id FROM profiles WHERE role = 'hr' LIMIT 1),
  'SS-2024-0002',
  'Mary Wanjiku',
  'Receptionist',
  'Administration',
  22000,
  'KES',
  'permanent',
  '+254700654321',
  'mary.reception@school.com',
  '2024-02-01',
  true,
  NOW(),
  NOW()
),
(
  (SELECT school_id FROM profiles WHERE role = 'hr' LIMIT 1),
  'SS-2024-0003',
  'Peter Kamau',
  'Watchman',
  'Security',
  18000,
  'KES',
  'contract',
  '+254700789123',
  'peter.security@school.com',
  '2024-03-01',
  true,
  NOW(),
  NOW()
),
(
  (SELECT school_id FROM profiles WHERE role = 'hr' LIMIT 1),
  'SS-2024-0004',
  'Grace Akinyi',
  'Cleaner',
  'Maintenance',
  15000,
  'KES',
  'temporary',
  '+254700456789',
  'grace.cleaner@school.com',
  '2024-04-01',
  false,
  NOW(),
  NOW()
);