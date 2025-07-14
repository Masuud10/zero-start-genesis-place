-- Phase 1: Create conversations table and related infrastructure for messaging feature

-- Create conversations table
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

-- Enable RLS on conversations table
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS policy for conversations - users can only see conversations they participate in
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (
  auth.uid() = participant_1_id OR 
  auth.uid() = participant_2_id
);

-- RLS policy for creating conversations
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  (auth.uid() = participant_1_id OR auth.uid() = participant_2_id) AND
  (participant_1_id != participant_2_id)
);

-- Update messages table to use proper conversation_id as UUID
ALTER TABLE public.messages 
ALTER COLUMN conversation_id TYPE uuid USING conversation_id::uuid;

-- Add foreign key constraint to messages table
ALTER TABLE public.messages 
ADD CONSTRAINT fk_messages_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Enable RLS on messages table if not already enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

-- RLS policy for messages - users can only see messages in conversations they participate in
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
  )
);

-- RLS policy for sending messages
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_school_id ON public.conversations(school_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

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

-- Enable realtime for conversations and messages tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;