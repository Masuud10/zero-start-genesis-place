-- Phase 1: Create conversations table and messaging infrastructure (Fixed)

-- First, create conversations table
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

-- Add a temporary new conversation_id_new column to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id_new uuid;

-- Create conversations for existing messages and update the new column
DO $$
DECLARE
    msg_record RECORD;
    conv_id uuid;
    participant_1 uuid;
    participant_2 uuid;
    msg_school_id uuid;
BEGIN
    FOR msg_record IN 
        SELECT DISTINCT sender_id, receiver_id, school_id
        FROM public.messages 
        WHERE sender_id IS NOT NULL AND receiver_id IS NOT NULL
    LOOP
        -- Determine participant order (smaller UUID first for consistency)
        IF msg_record.sender_id < msg_record.receiver_id THEN
            participant_1 := msg_record.sender_id;
            participant_2 := msg_record.receiver_id;
        ELSE
            participant_1 := msg_record.receiver_id;
            participant_2 := msg_record.sender_id;
        END IF;
        
        msg_school_id := msg_record.school_id;
        
        -- Insert or get existing conversation
        INSERT INTO public.conversations (participant_1_id, participant_2_id, school_id)
        VALUES (participant_1, participant_2, msg_school_id)
        ON CONFLICT (participant_1_id, participant_2_id) DO NOTHING
        RETURNING id INTO conv_id;
        
        -- If no id returned, get the existing conversation id
        IF conv_id IS NULL THEN
            SELECT id INTO conv_id 
            FROM public.conversations 
            WHERE participant_1_id = participant_1 AND participant_2_id = participant_2;
        END IF;
        
        -- Update all messages between these participants
        UPDATE public.messages 
        SET conversation_id_new = conv_id
        WHERE (sender_id = msg_record.sender_id AND receiver_id = msg_record.receiver_id)
           OR (sender_id = msg_record.receiver_id AND receiver_id = msg_record.sender_id);
    END LOOP;
END $$;

-- Drop the old conversation_id column and rename the new one
ALTER TABLE public.messages DROP COLUMN conversation_id;
ALTER TABLE public.messages RENAME COLUMN conversation_id_new TO conversation_id;

-- Add foreign key constraint
ALTER TABLE public.messages 
ADD CONSTRAINT fk_messages_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

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