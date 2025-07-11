# RPC Functions Setup Guide

This guide explains how to apply the missing RPC functions to your Supabase database.

## Overview

The following RPC functions have been created to support the analytics and reporting features in your applicatioN;

### Analytics Functions

- `get_school_analytics(p_school_id UUID)` - Get comprehensive analytics for a specific school
- `get_system_analytics()` - Get system-wide analytics (EduFam Admin only)
- `get_class_analytics(p_class_id UUID)` - Get analytics for a specific class
- `generate_report(report_type TEXT, report_params JSONB)` - Generate various types of reports

### User Management Functions

- `get_user_profile(p_user_id UUID)` - Get detailed user profile information
- `get_users_by_role(p_role TEXT, p_school_id UUID)` - Get users filtered by role and school

### Data Export and Search Functions

- `export_school_data(p_school_id UUID)` - Export comprehensive school data
- `get_dashboard_stats(p_school_id UUID)` - Get dashboard statistics based on user role
- `search_data(search_term TEXT, search_tables TEXT[], p_school_id UUID)` - Search across multiple tables

## How to Apply the Functions

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**

   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the SQL Script**

   - Copy the contents of `apply_rpc_functions.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

3. **Verify Installation**
   - Go to Database → Functions
   - You should see all the new functions listed

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (if not already linked)
supabase link --project-ref lmqyizrnuahkmwauonqr

# Apply the migrations
supabase db push
```

### Option 3: Individual Function Application

If you prefer to apply functions individually, you can copy and paste each function from the `apply_rpc_functions.sql` file into the Supabase SQL Editor.

## Function Details

### Analytics Functions

#### `get_school_analytics(p_school_id UUID)`

Returns comprehensive analytics for a school including:

- Student, teacher, and class counts
- Fee collection statistics
- Attendance rates
- Average grades

**Usage:**

```sql
SELECT public.get_school_analytics('your-school-id');
```

#### `get_system_analytics()`

Returns system-wide statistics (EduFam Admin only):

- Total schools, students, teachers, classes
- System-wide fee collection rates
- Average metrics per school

**Usage:**

```sql
SELECT public.get_system_analytics();
```

#### `get_class_analytics(p_class_id UUID)`

Returns analytics for a specific class:

- Student count and average grades
- Attendance rates
- Fee collection for the class

**Usage:**

```sql
SELECT public.get_class_analytics('your-class-id');
```

#### `generate_report(report_type TEXT, report_params JSONB)`

Generates various types of reports:

- `student_performance` - Student performance analysis
- `financial_summary` - Financial summary report
- `attendance_summary` - Attendance summary report

**Usage:**

```sql
SELECT public.generate_report('student_performance', '{"school_id": "your-school-id", "period": "2025-T1"}');
```

### User Management Functions

#### `get_user_profile(p_user_id UUID)`

Returns detailed user profile information including school details.

**Usage:**

```sql
SELECT public.get_user_profile(); -- Gets current user's profile
SELECT public.get_user_profile('specific-user-id'); -- Gets specific user's profile
```

#### `get_users_by_role(p_role TEXT, p_school_id UUID)`

Returns users filtered by role and optionally by school.

**Usage:**

```sql
SELECT public.get_users_by_role('teacher', 'your-school-id');
SELECT public.get_users_by_role('edufam_admin'); -- All edufam admins
```

### Data Export and Search Functions

#### `export_school_data(p_school_id UUID)`

Exports comprehensive school data including students, teachers, classes, fees, attendance, and grades.

**Usage:**

```sql
SELECT public.export_school_data('your-school-id');
```

#### `get_dashboard_stats(p_school_id UUID)`

Returns dashboard statistics based on the user's role:

- EduFam Admins get system-wide stats
- Other roles get school-specific stats

**Usage:**

```sql
SELECT public.get_dashboard_stats(); -- Uses current user's school
SELECT public.get_dashboard_stats('specific-school-id');
```

#### `search_data(search_term TEXT, search_tables TEXT[], p_school_id UUID)`

Searches across multiple tables for the given term.

**Usage:**

```sql
SELECT public.search_data('john', ARRAY['students']);
SELECT public.search_data('math', ARRAY['subjects'], 'your-school-id');
```

## Security Features

All functions include:

- **Row Level Security (RLS)** - Users can only access data from their own school
- **Role-based access** - EduFam Admins have broader access
- **SECURITY DEFINER** - Functions run with elevated privileges but respect user context
- **Input validation** - Parameters are validated and sanitized

## Testing the Functions

After applying the functions, you can test them with these queries:

```sql
-- Test system analytics (EduFam Admin only)
SELECT public.get_system_analytics();

-- Test dashboard stats
SELECT public.get_dashboard_stats();

-- Test user profile
SELECT public.get_user_profile();

-- Test search functionality
SELECT public.search_data('test', ARRAY['students']);
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**

   - Ensure you're logged in as an authenticated user
   - Check that your user has the appropriate role
   - Verify RLS policies are correctly applied

2. **Function Not Found Errors**

   - Ensure the functions were successfully created
   - Check the function names match exactly
   - Verify you're calling from the correct schema (public)

3. **Data Access Issues**
   - Ensure your user profile has a valid school_id
   - Check that the school_id exists in the schools table
   - Verify your role has the necessary permissions

### Verification Queries

Run these queries to verify the setup:

```sql
-- Check if functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%analytics%' OR routine_name LIKE '%report%';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Support

If you encounter any issues:

1. Check the Supabase logs in the dashboard
2. Verify your database schema matches the expected structure
3. Ensure all required tables exist and have the correct columns
4. Contact support if the issue persists

## Next Steps

After applying these functions:

1. Test the functions in your application
2. Update any TypeScript types if needed
3. Monitor performance and optimize queries if necessary
4. Consider adding indexes for frequently queried columns
