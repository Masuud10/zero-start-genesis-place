-- Ensure maintenance mode settings exist
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES (
  'maintenance_mode', 
  '{"enabled": false, "message": "System is currently under maintenance. Please try again later."}',
  'Controls system maintenance mode'
) ON CONFLICT (setting_key) DO NOTHING;