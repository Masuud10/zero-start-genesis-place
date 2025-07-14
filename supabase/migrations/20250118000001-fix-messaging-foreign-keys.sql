-- Fix Messaging System Foreign Key Issues
-- This migration addresses the "Something went wrong" error in the messaging feature

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

-- 5. Ensure proper foreign key constraints exist
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

-- 6. Ensure RLS policies are correct
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;

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

-- 7. Add policy for updating messages (marking as read)
CREATE POLICY "Users can update their received messages"
ON public.messages
FOR UPDATE
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());

-- 8. Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);

-- 9. Update table statistics
ANALYZE public.messages;
ANALYZE public.conversations;
ANALYZE public.profiles; 