-- Add forensic logging to the create_notifications_for_communication function
-- This will help diagnose why notifications are not being created

CREATE OR REPLACE FUNCTION create_notifications_for_communication()
RETURNS TRIGGER AS $$
DECLARE
  target_user_count INTEGER;
  inserted_count INTEGER;
  user_ids TEXT[];
BEGIN
  -- Log the incoming communication data
  RAISE LOG '🔔 NOTIFICATION DEBUG: Creating notifications for communication ID: %, Title: %, Target roles: %', 
    NEW.id, NEW.title, NEW.target_roles;
  
  -- Get the list of user IDs that match the target roles
  SELECT array_agg(p.id::text), COUNT(*)
  INTO user_ids, target_user_count
  FROM public.profiles p
  WHERE p.role = ANY(NEW.target_roles)
    AND p.id IS NOT NULL;
  
  -- Log the user IDs and count
  RAISE LOG '🔔 NOTIFICATION DEBUG: Found % users with matching roles: %', target_user_count, user_ids;
  
  -- If no users found, log and return
  IF target_user_count = 0 THEN
    RAISE LOG '🔔 NOTIFICATION DEBUG: No users found with roles: %. Skipping notification creation.', NEW.target_roles;
    RETURN NEW;
  END IF;
  
  -- Insert notification records for all users with matching roles
  INSERT INTO public.notifications (user_id, announcement_id, is_read, created_at, updated_at)
  SELECT 
    p.id as user_id,
    NEW.id as announcement_id,
    FALSE as is_read,
    NOW() as created_at,
    NOW() as updated_at
  FROM public.profiles p
  WHERE p.role = ANY(NEW.target_roles)
    AND p.id IS NOT NULL;
  
  -- Get the count of inserted records
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  
  -- Log the insertion results
  RAISE LOG '🔔 NOTIFICATION DEBUG: Successfully inserted % notification records for communication ID: %', inserted_count, NEW.id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log any errors that occur during notification creation
  RAISE LOG '🔔 NOTIFICATION ERROR: Failed to create notifications for communication ID: %. Error: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 