
-- Remove the old no_swipe_out_threshold_hours setting if it exists
DELETE FROM system_settings WHERE setting_key = 'no_swipe_out_threshold_hours';

-- Add the new alert time setting if it doesn't already exist
INSERT INTO system_settings (setting_key, setting_value, setting_type, description)
SELECT 'no_swipe_out_alert_time', '18:00', 'string', 'Time of day after which no swipe out alert is triggered'
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings WHERE setting_key = 'no_swipe_out_alert_time'
);
