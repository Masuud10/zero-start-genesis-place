-- Enable HR users to access profiles for their school
CREATE POLICY "Enable HR to view profiles in their school"
ON public.profiles FOR SELECT
USING (
  (auth.uid() = id) OR 
  (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'hr' 
      AND p.school_id = profiles.school_id
    )
  )
);

-- Enable HR to manage users in their school  
CREATE POLICY "Enable HR to manage users in their school"
ON public.profiles FOR UPDATE
USING (
  (auth.uid() = id) OR 
  (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'hr' 
      AND p.school_id = profiles.school_id
    )
  )
);

-- Enable HR to view user login details for their school
CREATE POLICY "Enable HR to view user_login_details in their school"
ON public.user_login_details FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (
    EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2
      WHERE p1.id = auth.uid() 
      AND p1.role = 'hr'
      AND p2.id = user_login_details.user_id
      AND p1.school_id = p2.school_id
    )
  )
);

-- Enable HR to update user login details for their school
CREATE POLICY "Enable HR to update user_login_details in their school"
ON public.user_login_details FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  (
    EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2
      WHERE p1.id = auth.uid() 
      AND p1.role = 'hr'
      AND p2.id = user_login_details.user_id
      AND p1.school_id = p2.school_id
    )
  )
);