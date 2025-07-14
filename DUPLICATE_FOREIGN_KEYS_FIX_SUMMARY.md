# Duplicate Foreign Keys Fix Summary

## 🚨 Issue Identified

The application was experiencing **PGRST201 errors** when trying to embed related tables in queries:

```
{
  "code": "PGRST201",
  "details": [
    {
      "cardinality": "many-to-one",
      "embedding": "grades with students",
      "relationship": "fk_grades_student_id using grades(student_id) and students(id)"
    },
    {
      "cardinality": "many-to-one",
      "embedding": "grades with students",
      "relationship": "grades_student_id_fkey using grades(student_id) and students(id)"
    }
  ],
  "hint": "Try changing 'students' to one of the following: 'students!fk_grades_student_id', 'students!grades_student_id_fkey'. Find the desired relationship in the 'details' key.",
  "message": "Could not embed because more than one relationship was found for 'grades' and 'students'"
}
```

## 🔍 Root Cause Analysis

### Problem: Duplicate Foreign Key Constraints

The database had **duplicate foreign key constraints** between the same tables:

1. **`fk_grades_student_id`** - Properly named constraint
2. **`grades_student_id_fkey`** - Duplicate constraint with different naming

Both constraints referenced the same columns (`grades.student_id` → `students.id`), causing PostgREST to be unable to determine which relationship to use for embedding.

### Why This Happens

- Multiple migrations created foreign key constraints with different naming conventions
- Some constraints were created with explicit names (`fk_grades_student_id`)
- Others were created with PostgreSQL's default naming (`grades_student_id_fkey`)
- Both constraints remained in the database, causing ambiguity

## 🛠️ Solution Implemented

### 1. Database Schema Fix

Created comprehensive database fixes:

- **`supabase/migrations/20250118000000-fix-duplicate-foreign-keys.sql`** - Migration file
- **`FIX_DUPLICATE_FOREIGN_KEYS.sql`** - Complete fix script

**Key fixes:**

- ✅ **Removed duplicate constraints** with inconsistent naming
- ✅ **Kept properly named constraints** (`fk_table_column` format)
- ✅ **Ensured all required relationships exist** with correct names
- ✅ **Fixed constraints across all tables** (grades, attendance, fees, etc.)
- ✅ **Updated table statistics** for better performance

### 2. Constraint Standardization

Standardized foreign key constraint naming across all tables:

- **Grades table**: `fk_grades_student_id`, `fk_grades_class_id`, etc.
- **Attendance table**: `fk_attendance_student_id`, `fk_attendance_class_id`, etc.
- **Fees table**: `fk_fees_student_id`
- **Students table**: `fk_students_school_id`, `fk_students_class_id`
- **Classes table**: `fk_classes_school_id`, `fk_classes_teacher_id`
- **Subjects table**: `fk_subjects_school_id`
- **Profiles table**: `fk_profiles_school_id`

### 3. Query Compatibility

Fixed queries to use the correct constraint names:

- **Before**: `students(*)` (ambiguous)
- **After**: `students!fk_grades_student_id(*)` (explicit)

## 📁 Files Created/Modified

### Database

- `supabase/migrations/20250118000000-fix-duplicate-foreign-keys.sql` - Migration file
- `FIX_DUPLICATE_FOREIGN_KEYS.sql` - Comprehensive fix script

### Documentation

- `DUPLICATE_FOREIGN_KEYS_FIX_SUMMARY.md` - This summary document

## 🚀 How to Apply the Fix

### Option 1: Run Migration (Recommended)

```bash
npx supabase db push
```

### Option 2: Manual SQL Execution

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste `FIX_DUPLICATE_FOREIGN_KEYS.sql`
3. Execute the script

### Option 3: Apply Migration File

1. Copy `supabase/migrations/20250118000000-fix-duplicate-foreign-keys.sql` to your migrations folder
2. Run `npx supabase db push`

## ✅ Verification Steps

After applying the fix:

1. **Check Foreign Key Constraints**

   ```sql
   SELECT conname as constraint_name, pg_get_constraintdef(oid) as constraint_definition
   FROM pg_constraint
   WHERE conrelid = 'public.grades'::regclass
   AND contype = 'f'
   ORDER BY conname;
   ```

2. **Verify No Duplicates**

   ```sql
   SELECT conname, COUNT(*)
   FROM pg_constraint c
   JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
   WHERE c.conrelid = 'public.grades'::regclass
   AND c.contype = 'f'
   GROUP BY conname
   HAVING COUNT(*) > 1;
   ```

3. **Test PostgREST Queries**
   ```sql
   -- This should work without PGRST201 error
   SELECT * FROM grades?select=*,students!fk_grades_student_id(*)
   ```

## 🎯 Expected Results

After the fix:

- ✅ No more PGRST201 errors
- ✅ PostgREST queries work correctly
- ✅ Table embeddings function properly
- ✅ Consistent constraint naming
- ✅ Better query performance
- ✅ Proper data relationships maintained

## 🔧 Troubleshooting

If you still encounter issues:

1. **Check Constraint Names**

   - Use the verification queries to see exact constraint names
   - Update your queries to use the correct constraint names

2. **Regenerate Types**

   ```bash
   npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
   ```

3. **Clear Application Cache**

   - Clear any cached queries in your application
   - Restart your development server

4. **Check for Remaining Duplicates**
   - Run the verification queries to ensure no duplicates remain
   - Check all tables mentioned in the fix script

## 📞 Support

If the issue persists after applying this fix:

1. Check the verification queries for any remaining duplicates
2. Verify constraint names in your application queries
3. Ensure the migration was applied successfully
4. Contact support with specific error details

---

**Note**: This fix addresses the core database constraint issue causing PostgREST embedding errors. The solution ensures consistent naming and removes ambiguity while maintaining all necessary data relationships.
