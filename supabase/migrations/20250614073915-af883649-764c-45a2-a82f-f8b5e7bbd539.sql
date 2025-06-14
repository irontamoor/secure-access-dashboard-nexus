
-- Add a new setting for the No Swipe Out threshold (hours) if it doesn't exist
INSERT INTO system_settings (setting_key, setting_value, setting_type, description)
SELECT 'no_swipe_out_threshold_hours', '2', 'number', 'Number of hours after which no swipe out alert is triggered'
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings WHERE setting_key = 'no_swipe_out_threshold_hours'
);
