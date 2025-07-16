-- Create a function to generate a password reset for Sharon (HR user)
CREATE OR REPLACE FUNCTION public.generate_hr_user_reset_instructions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Check if Sharon exists and is properly configured
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = 'sharon@gmail.com' 
        AND role = 'hr' 
        AND status = 'active'
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Sharon HR user not found or not properly configured'
        );
    END IF;

    -- Return instructions for manual password reset
    RETURN jsonb_build_object(
        'success', true,
        'message', 'HR user Sharon account is ready for login',
        'instructions', jsonb_build_object(
            'email', 'sharon@gmail.com',
            'role', 'hr',
            'school', 'Nakuru High',
            'status', 'Account is active and ready for login',
            'next_steps', ARRAY[
                'Use the login page at /login',
                'Enter email: sharon@gmail.com',
                'If password is unknown, use the "Forgot Password" feature',
                'The system will send a password reset email',
                'After login, access the HR Dashboard with full HR management features'
            ],
            'dashboard_features', ARRAY[
                'Staff Management',
                'Payroll Processing', 
                'Attendance Monitoring',
                'HR Reports and Analytics',
                'User Management'
            ]
        )
    );
END $$;