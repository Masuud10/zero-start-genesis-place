# Parent Grades Access Troubleshooting Guide

## Issue Description

Parents are getting "Could not fetch grades" error when trying to view their children's grades in the parent dashboard.

## Root Cause

The issue was caused by a recent database migration that replaced the parent-friendly grades RLS (Row Level Security) policy with a strict school isolation policy that only allows access based on `school_id = public.get_current_user_school_id()`. This policy doesn't include the parent access logic.

## Solution

### 1. Database Fix (Required)

Run the following SQL script on your Supabase database:

```sql
-- Fix parent grades access by updating the RLS policy to include parent access logic
-- Drop the current restrictive policy
DROP POLICY IF EXISTS "Multi-tenant grades access" ON public.grades;

-- Create a new comprehensive policy that includes parent access
CREATE POLICY "Multi-tenant grades access with parent support" ON public.grades
FOR ALL USING (
  -- Admin access
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School-based access for staff
  (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')) OR
  -- Parent access to their children's grades
  (public.get_current_user_role() = 'parent' AND student_id IN (SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid()))
);

-- Also update the subjects policy to ensure parents can access subject information
DROP POLICY IF EXISTS "Multi-tenant subjects access" ON public.subjects;

CREATE POLICY "Multi-tenant subjects access with parent support" ON public.subjects
FOR ALL USING (
  -- Admin access
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School-based access for staff
  (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')) OR
  -- Parent access to subjects for their children's classes
  (public.get_current_user_role() = 'parent' AND class_id IN (
    SELECT DISTINCT s.class_id
    FROM public.students s
    JOIN public.parent_students ps ON s.id = ps.student_id
    WHERE ps.parent_id = auth.uid()
  ))
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_grades_student_status ON public.grades(student_id, status) WHERE status = 'released';
CREATE INDEX IF NOT EXISTS idx_parent_students_parent_student ON public.parent_students(parent_id, student_id);
```

### 2. Code Improvements (Already Applied)

The following improvements have been made to the codebase:

#### Enhanced Error Handling

- Added detailed console logging for debugging
- Improved error messages with specific details
- Added timeout handling (increased to 10 seconds)
- Better type safety with proper interfaces

#### Files Modified:

- `src/hooks/useParentChildrenGrades.ts` - Enhanced error handling and logging
- `src/components/grades/ParentGradesView.tsx` - Improved error handling and debugging
- `supabase/migrations/20250103000001-fix-parent-grades-access.sql` - Database migration

## Verification Steps

### 1. Check Database Policies

Run this query to verify the policy was created correctly:

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'grades'
AND policyname = 'Multi-tenant grades access with parent support';
```

### 2. Test Parent Access

1. Log in as a parent user
2. Navigate to the grades section
3. Check browser console for detailed logs
4. Verify that grades are displayed correctly

### 3. Check Parent-Student Relationships

Verify that parent-student relationships exist:

```sql
SELECT
  p.email as parent_email,
  s.name as student_name,
  ps.student_id,
  ps.parent_id
FROM parent_students ps
JOIN profiles p ON ps.parent_id = p.id
JOIN students s ON ps.student_id = s.id
WHERE p.role = 'parent'
LIMIT 10;
```

### 4. Check Released Grades

Verify that there are released grades for the students:

```sql
SELECT
  g.student_id,
  s.name as student_name,
  g.status,
  g.term,
  g.exam_type,
  g.score
FROM grades g
JOIN students s ON g.student_id = s.id
WHERE g.status = 'released'
LIMIT 10;
```

## Common Issues and Solutions

### Issue 1: "No children found for parent"

**Cause**: No parent-student relationships exist in the `parent_students` table.

**Solution**:

1. Check if parent-student relationships are being created correctly
2. Verify the parent's user ID matches the `parent_id` in the `parent_students` table

### Issue 2: "Could not fetch grades" with RLS error

**Cause**: The RLS policy is blocking access.

**Solution**:

1. Run the database fix script above
2. Verify the policy was created correctly
3. Check that the parent's role is set to 'parent'

### Issue 3: "No released grades found"

**Cause**: Grades exist but are not marked as 'released'.

**Solution**:

1. Check the `status` field in the `grades` table
2. Ensure grades are being marked as 'released' when appropriate
3. Verify the grade release workflow

### Issue 4: Performance issues

**Cause**: Missing indexes or inefficient queries.

**Solution**:

1. Ensure the performance indexes are created
2. Check query execution plans
3. Consider adding more specific indexes based on usage patterns

## Debugging

### Enable Detailed Logging

The code now includes detailed console logging. Check the browser console for:

- `📚 Parent Children Grades: Starting fetch for parent: [user_id]`
- `📚 Fetching parent-student relationships...`
- `📚 Found students: [count] Student IDs: [ids]`
- `📚 Fetching students and grades data...`
- `📚 Students data: [count] records`
- `📚 Grades data: [count] records`
- `📚 Successfully loaded grades for [count] children`

### Common Error Messages

- `Could not fetch your children information: [error]` - Issue with parent-student relationships
- `Could not fetch grades: [error]` - Issue with grades table access
- `Grades query timed out` - Performance issue, try again
- `No children found for parent` - No parent-student relationships exist

## Prevention

To prevent this issue in the future:

1. Always test RLS policies thoroughly before deploying
2. Include comprehensive test cases for parent access
3. Monitor database policy changes
4. Maintain backward compatibility when updating policies
5. Document policy changes and their impact

## Support

If the issue persists after applying these fixes:

1. Check the browser console for detailed error messages
2. Verify the database policies are correctly applied
3. Test with a known working parent-student relationship
4. Contact the development team with the specific error details
