-- MESSAGING SCHEMA UNIFICATION
-- This script resolves the critical database schema conflict in the messaging feature
-- WARNING: This will delete all existing messages. This step is necessary to fix the conflict.

-- ============================================================================
-- PHASE 1: DROP OLD, CONFLICTING TABLES
-- ============================================================================

-- Step 1: Drop the old, conflicting tables to start fresh.
-- This will delete all existing messages but is necessary to fix the conflict.
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- ============================================================================
-- PHASE 2: CREATE THE CORRECT SCHEMA
-- ============================================================================

-- Step 2: Create the 'conversations' table.
-- This table only tracks who is in a chat.
CREATE TABLE public.conversations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    participant_ids UUID[] NOT NULL -- An array of user IDs in the conversation
);

-- Step 3: Create the 'messages' table.
-- This table holds the actual messages and links to a conversation.
CREATE TABLE public.messages (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    content TEXT NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_id BIGINT REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL
);

-- ============================================================================
-- PHASE 3: ENABLE ROW-LEVEL SECURITY
-- ============================================================================

-- Step 4: Enable Row-Level Security (RLS) for security.
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PHASE 4: CREATE RLS POLICIES
-- ============================================================================

-- Step 5: Create RLS Policies.

-- Users can only see conversations they are a part of.
CREATE POLICY "Allow access to own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = ANY(participant_ids));

-- Users can create conversations they are a part of.
CREATE POLICY "Allow creating conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = ANY(participant_ids));

-- Users can only see messages in conversations they are a part of.
CREATE POLICY "Allow access to messages in own conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND auth.uid() = ANY(conversations.participant_ids)
  )
);

-- Users can only send messages in conversations they are a part of.
CREATE POLICY "Allow sending messages in own conversations"
ON public.messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id 
    AND auth.uid() = ANY(conversations.participant_ids)
  )
  AND (auth.uid() = sender_id)
);

-- ============================================================================
-- PHASE 5: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX idx_conversations_participant_ids ON public.conversations USING GIN (participant_ids);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);

-- ============================================================================
-- PHASE 6: ENABLE REALTIME
-- ============================================================================

-- Enable realtime for messaging tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================================================
-- PHASE 7: VERIFICATION
-- ============================================================================

-- Verify the tables were created correctly
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('conversations', 'messages')
ORDER BY table_name, ordinal_position;

-- Verify RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- After running this script:
-- 1. Old conflicting tables are dropped
-- 2. New correct schema is created
-- 3. RLS policies are in place for security
-- 4. Indexes are created for performance
-- 5. Realtime is enabled for live updates
-- 6. Messaging system is ready for backend and frontend integration

-- ============================================================================
-- NEXT STEPS
-- ============================================================================
-- 1. Run this script in Supabase SQL Editor
-- 2. Proceed to Phase 2: Backend API Repair
-- 3. Proceed to Phase 3: Frontend Component Repair 