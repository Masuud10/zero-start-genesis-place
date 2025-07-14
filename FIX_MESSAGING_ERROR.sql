-- Fix Messaging System "Something went wrong" Error
-- Run this script on your Supabase database to fix the messaging feature

-- ============================================================================
-- ROOT CAUSE ANALYSIS
-- ============================================================================
-- The error occurs because:
-- 1. Frontend is trying to use non-existent foreign key references
-- 2. Missing sender_name and receiver_name columns or data
-- 3. Incorrect RLS policies
-- 4. Missing database triggers for automatic name population

-- ============================================================================
-- SOLUTION: FIX DATABASE SCHEMA AND DATA
-- ============================================================================

-- 1. Ensure sender_name and receiver_name columns exist
DO $$
BEGIN
  -- Add sender_name to messages if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'sender_name') THEN
    ALTER TABLE public.messages ADD COLUMN sender_name text;
  END IF;
  
  -- Add receiver_name to messages if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'receiver_name') THEN
    ALTER TABLE public.messages ADD COLUMN receiver_name text;
  END IF;
END $$;

-- 2. Create function to automatically populate sender_name and receiver_name
CREATE OR REPLACE FUNCTION populate_message_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Populate sender_name if not provided
  IF NEW.sender_name IS NULL OR NEW.sender_name = '' THEN
    SELECT name INTO NEW.sender_name 
    FROM public.profiles 
    WHERE id = NEW.sender_id;
    
    IF NEW.sender_name IS NULL THEN
      NEW.sender_name := 'Unknown';
    END IF;
  END IF;
  
  -- Populate receiver_name if not provided
  IF NEW.receiver_name IS NULL OR NEW.receiver_name = '' THEN
    SELECT name INTO NEW.receiver_name 
    FROM public.profiles 
    WHERE id = NEW.receiver_id;
    
    IF NEW.receiver_name IS NULL THEN
      NEW.receiver_name := 'Unknown';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger to automatically populate names
DROP TRIGGER IF EXISTS trigger_populate_message_names ON public.messages;
CREATE TRIGGER trigger_populate_message_names
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION populate_message_names();

-- 4. Update existing messages with missing names
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

-- 5. Ensure conversations table exists with proper structure
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

-- 6. Ensure messages table has proper structure
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

-- 7. Add missing columns to messages if they don't exist
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
  
  -- Add attachments to messages if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'attachments') THEN
    ALTER TABLE public.messages ADD COLUMN attachments text[];
  END IF;
END $$;

-- 8. Add foreign key constraints if they don't exist
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

-- 9. Enable RLS on both tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 10. Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;

-- 11. RLS Policies for conversations
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

-- 12. RLS Policies for messages
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

CREATE POLICY "Users can update their received messages"
ON public.messages
FOR UPDATE
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());

-- 13. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_school_id ON public.conversations(school_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_school_id ON public.messages(school_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);

-- 14. Function to update conversation timestamp when a new message is sent
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

-- 15. Trigger to update conversation timestamp
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON public.messages;
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- 16. Enable realtime for conversations and messages tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 17. Update table statistics
ANALYZE public.conversations;
ANALYZE public.messages;
ANALYZE public.profiles;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if tables exist and have correct structure
SELECT 'conversations' as table_name, COUNT(*) as row_count FROM public.conversations
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as row_count FROM public.messages;

-- Check for messages with missing names
SELECT COUNT(*) as messages_with_missing_names 
FROM public.messages 
WHERE sender_name IS NULL OR receiver_name IS NULL OR sender_name = '' OR receiver_name = '';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname; 