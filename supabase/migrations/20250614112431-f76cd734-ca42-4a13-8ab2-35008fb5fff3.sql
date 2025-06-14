
-- Add CC email address setting if it doesn't exist
INSERT INTO system_settings (setting_key, setting_value, setting_type, description)
SELECT 'email_cc_address', '', 'string', 'All notification emails will CC to this email address'
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings WHERE setting_key = 'email_cc_address'
);
