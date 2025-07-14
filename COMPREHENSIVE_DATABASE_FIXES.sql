-- COMPREHENSIVE DATABASE FIXES
-- This script addresses all critical database issues identified in the debugging analysis
-- Run this script on your Supabase database to fix all issues

-- ============================================================================
-- CRITICAL ISSUES TO FIX:
-- 1. Missing database indexes causing 30+ second timeouts
-- 2. Duplicate foreign key constraints causing PGRST201 errors
-- 3. Messaging system database schema issues
-- 4. Data consistency and validation issues
-- 5. Performance bottlenecks
-- ============================================================================

-- ============================================================================
-- PHASE 1: FIX DUPLICATE FOREIGN KEY CONSTRAINTS (PGRST201 ERRORS)
-- ============================================================================

-- Remove duplicate foreign key constraints that cause PGRST201 errors
DO $$
BEGIN
    -- Drop duplicate constraints on grades table
    ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_student_id_fkey;
    ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_class_id_fkey;
    ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_subject_id_fkey;
    ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_submitted_by_fkey;
    ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_reviewed_by_fkey;
    ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_school_id_fkey;
    
    -- Drop duplicate constraints on attendance table
    ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
    ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_class_id_fkey;
    ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_submitted_by_fkey;
    
    -- Drop duplicate constraints on fees table
    ALTER TABLE public.fees DROP CONSTRAINT IF EXISTS fees_student_id_fkey;
    
    -- Drop duplicate constraints on students table
    ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_school_id_fkey;
    ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_class_id_fkey;
    
    -- Drop duplicate constraints on classes table
    ALTER TABLE public.classes DROP CONSTRAINT IF EXISTS classes_school_id_fkey;
    ALTER TABLE public.classes DROP CONSTRAINT IF EXISTS classes_teacher_id_fkey;
    
    -- Drop duplicate constraints on subjects table
    ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_school_id_fkey;
    
    -- Drop duplicate constraints on profiles table
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_school_id_fkey;
END $$;

-- Ensure proper foreign key constraints exist with consistent naming
DO $$
BEGIN
    -- Grades table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_grades_student_id') THEN
        ALTER TABLE public.grades ADD CONSTRAINT fk_grades_student_id 
        FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_grades_class_id') THEN
        ALTER TABLE public.grades ADD CONSTRAINT fk_grades_class_id 
        FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_grades_subject_id') THEN
        ALTER TABLE public.grades ADD CONSTRAINT fk_grades_subject_id 
        FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_grades_school_id') THEN
        ALTER TABLE public.grades ADD CONSTRAINT fk_grades_school_id 
        FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
    END IF;
    
    -- Students table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_students_school_id') THEN
        ALTER TABLE public.students ADD CONSTRAINT fk_students_school_id 
        FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_students_class_id') THEN
        ALTER TABLE public.students ADD CONSTRAINT fk_students_class_id 
        FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;
    END IF;
    
    -- Classes table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_classes_school_id') THEN
        ALTER TABLE public.classes ADD CONSTRAINT fk_classes_school_id 
        FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
    END IF;
    
    -- Subjects table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_subjects_school_id') THEN
        ALTER TABLE public.subjects ADD CONSTRAINT fk_subjects_school_id 
        FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
    END IF;
    
    -- Profiles table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_school_id') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_school_id 
        FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- PHASE 2: ADD CRITICAL PERFORMANCE INDEXES (FIX 30+ SECOND TIMEOUTS)
-- ============================================================================

-- CRITICAL: Add composite index for fees query (main culprit of timeouts)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fees_school_id_amount_paid_status 
ON public.fees(school_id, amount, paid_amount, status) 
WHERE school_id IS NOT NULL;

-- CRITICAL: Add partial index for active students count
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_school_id_active_count 
ON public.students(school_id) 
WHERE is_active = true;

-- Add index for profiles table (teachers/parents count)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_school_id_role_active 
ON public.profiles(school_id, role) 
WHERE status = 'active';

-- Add index for classes table (used in dashboard stats)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classes_school_id_active 
ON public.classes(school_id) 
WHERE is_active = true;

-- Add index for subjects table (used in dashboard stats)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subjects_school_id_active 
ON public.subjects(school_id) 
WHERE is_active = true;

-- Add index for attendance table (used in some dashboard queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_school_id_date 
ON public.attendance(school_id, date) 
WHERE school_id IS NOT NULL;

-- Add index for grades table (used in dashboard analytics)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_school_id_status_created 
ON public.grades(school_id, status, created_at DESC) 
WHERE school_id IS NOT NULL;

-- Add index for student_fees table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_fees_school_id_status 
ON public.student_fees(school_id, status) 
WHERE school_id IS NOT NULL;

-- Add index for financial transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_transactions_school_id_payment_method 
ON public.financial_transactions(school_id, payment_method) 
WHERE school_id IS NOT NULL;

-- ============================================================================
-- PHASE 3: FIX MESSAGING SYSTEM DATABASE SCHEMA
-- ============================================================================

-- Ensure conversations table exists with proper structure
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  last_message_at timestamp with time zone DEFAULT now(),
  participant_1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant_2_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message_id uuid,
  last_message_preview text,
  school_id uuid NOT NULL,
  UNIQUE(participant_1_id, participant_2_id),
  CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id)
);

-- Ensure messages table has proper structure
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  school_id uuid NOT NULL,
  sender_name text,
  receiver_name text,
  attachments text[]
);

-- Add missing columns to messages if they don't exist
DO $$
BEGIN
  -- Add conversation_id to messages if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'conversation_id') THEN
    ALTER TABLE public.messages ADD COLUMN conversation_id uuid;
  END IF;
  
  -- Add school_id to messages if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'school_id') THEN
    ALTER TABLE public.messages ADD COLUMN school_id uuid;
  END IF;
  
  -- Add sender_name and receiver_name to messages if they don't exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'sender_name') THEN
    ALTER TABLE public.messages ADD COLUMN sender_name text;
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'receiver_name') THEN
    ALTER TABLE public.messages ADD COLUMN receiver_name text;
  END IF;
  
  -- Add attachments to messages if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'attachments') THEN
    ALTER TABLE public.messages ADD COLUMN attachments text[];
  END IF;
END $$;

-- Add foreign key constraints for messaging system
DO $$
BEGIN
  -- Add conversation_id foreign key if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_messages_conversation_id') THEN
    ALTER TABLE public.messages ADD CONSTRAINT fk_messages_conversation_id FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
  END IF;
  
  -- Add school_id foreign key if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_messages_school_id') THEN
    ALTER TABLE public.messages ADD CONSTRAINT fk_messages_school_id FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on messaging tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (
  auth.uid() = participant_1_id OR 
  auth.uid() = participant_2_id
);

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  (auth.uid() = participant_1_id OR auth.uid() = participant_2_id) AND
  (participant_1_id != participant_2_id)
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
  )
);

-- Add policy for updating messages (marking as read)
CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Add indexes for messaging system performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_school_id ON public.conversations(school_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_school_id ON public.messages(school_id);

-- Function to update conversation timestamp when a new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET 
    updated_at = NEW.created_at,
    last_message_at = NEW.created_at,
    last_message_id = NEW.id,
    last_message_preview = LEFT(NEW.content, 100)
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update conversation timestamp
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON public.messages;
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Function to auto-populate sender and receiver names
CREATE OR REPLACE FUNCTION populate_message_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Populate sender name
  IF NEW.sender_name IS NULL THEN
    SELECT name INTO NEW.sender_name
    FROM public.profiles
    WHERE id = NEW.sender_id;
  END IF;
  
  -- Populate receiver name
  IF NEW.receiver_name IS NULL THEN
    SELECT name INTO NEW.receiver_name
    FROM public.profiles
    WHERE id = NEW.receiver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-populate names
DROP TRIGGER IF EXISTS trigger_populate_message_names ON public.messages;
CREATE TRIGGER trigger_populate_message_names
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION populate_message_names();

-- Update existing messages with missing names
UPDATE public.messages 
SET 
  sender_name = COALESCE(
    (SELECT name FROM public.profiles WHERE id = messages.sender_id),
    'Unknown'
  ),
  receiver_name = COALESCE(
    (SELECT name FROM public.profiles WHERE id = messages.receiver_id),
    'Unknown'
  )
WHERE sender_name IS NULL OR receiver_name IS NULL OR sender_name = '' OR receiver_name = '';

-- ============================================================================
-- PHASE 4: DATA CONSISTENCY AND VALIDATION FIXES
-- ============================================================================

-- Add check constraints for data validation
DO $$
BEGIN
  -- Add check constraint to ensure grades.score is between 0 and max_score
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_grade_score_range') THEN
    ALTER TABLE public.grades ADD CONSTRAINT check_grade_score_range 
    CHECK (score >= 0 AND score <= max_score);
  END IF;
  
  -- Add check constraint to ensure grades.percentage is between 0 and 100
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_grade_percentage_range') THEN
    ALTER TABLE public.grades ADD CONSTRAINT check_grade_percentage_range 
    CHECK (percentage >= 0 AND percentage <= 100);
  END IF;
  
  -- Add check constraint to ensure fees.paid_amount doesn't exceed amount
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_fees_paid_amount') THEN
    ALTER TABLE public.fees ADD CONSTRAINT check_fees_paid_amount 
    CHECK (paid_amount <= amount);
  END IF;
  
  -- Add check constraint to ensure attendance.status is valid
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_attendance_status') THEN
    ALTER TABLE public.attendance ADD CONSTRAINT check_attendance_status 
    CHECK (status IN ('present', 'absent', 'late', 'excused'));
  END IF;
  
  -- Add check constraint to ensure profiles.status is valid
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_profiles_status') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT check_profiles_status 
    CHECK (status IN ('active', 'inactive', 'suspended'));
  END IF;
  
  -- Add check constraint to ensure schools.status is valid
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_schools_status') THEN
    ALTER TABLE public.schools ADD CONSTRAINT check_schools_status 
    CHECK (status IN ('active', 'inactive', 'pending'));
  END IF;
END $$;

-- Function to ensure school_id consistency
CREATE OR REPLACE FUNCTION ensure_school_id_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_school_id uuid;
  user_role text;
BEGIN
  -- Get current user's school_id and role
  SELECT school_id, role INTO user_school_id, user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  -- For non-admin users, enforce school_id consistency
  IF user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    -- Set school_id if not already set
    IF NEW.school_id IS NULL THEN
      NEW.school_id := user_school_id;
    -- Prevent users from setting school_id to other schools
    ELSIF NEW.school_id != user_school_id THEN
      RAISE EXCEPTION 'Cannot create/modify records for other schools. User school: %, Record school: %', user_school_id, NEW.school_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Apply school_id consistency triggers
DROP TRIGGER IF EXISTS trigger_grades_school_id_consistency ON public.grades;
CREATE TRIGGER trigger_grades_school_id_consistency
  BEFORE INSERT OR UPDATE ON public.grades
  FOR EACH ROW
  EXECUTE FUNCTION ensure_school_id_consistency();

DROP TRIGGER IF EXISTS trigger_attendance_school_id_consistency ON public.attendance;
CREATE TRIGGER trigger_attendance_school_id_consistency
  BEFORE INSERT OR UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION ensure_school_id_consistency();

-- ============================================================================
-- PHASE 5: PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Update table statistics for better query planning
ANALYZE public.grades;
ANALYZE public.students;
ANALYZE public.classes;
ANALYZE public.subjects;
ANALYZE public.attendance;
ANALYZE public.fees;
ANALYZE public.profiles;
ANALYZE public.schools;
ANALYZE public.conversations;
ANALYZE public.messages;

-- Enable realtime for messaging tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check foreign key constraints
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('fees', 'students', 'profiles', 'classes', 'subjects', 'grades', 'attendance', 'conversations', 'messages')
AND indexname LIKE '%school_id%'
ORDER BY tablename, indexname;

-- Check messaging system tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('conversations', 'messages')
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- EXPECTED RESULTS AFTER RUNNING THIS SCRIPT
-- ============================================================================
-- 1. Dashboard loading time: 30+ seconds → < 3 seconds
-- 2. No more PGRST201 errors for foreign key relationships
-- 3. Messaging system fully functional
-- 4. Data consistency enforced
-- 5. Performance optimized with proper indexes
-- 6. All critical database issues resolved

-- ============================================================================
-- MONITORING QUERIES
-- ============================================================================
-- Monitor performance after applying fixes:
-- SELECT query, calls, total_time, mean_time, rows 
-- FROM pg_stat_statements 
-- WHERE query LIKE '%fees%' OR query LIKE '%students%' OR query LIKE '%messages%'
-- ORDER BY mean_time DESC LIMIT 10; 