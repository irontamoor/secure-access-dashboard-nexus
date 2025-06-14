
-- Add LDAP settings to system_settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES
('ldap_enabled', 'false', 'boolean', 'Enable LDAP authentication'),
('ldap_server_url', '', 'string', 'LDAP server URL (e.g., ldap://domain.com:389)'),
('ldap_bind_dn', '', 'string', 'LDAP bind DN for authentication'),
('ldap_bind_password', '', 'string', 'LDAP bind password'),
('ldap_user_search_base', '', 'string', 'LDAP user search base DN'),
('ldap_user_search_filter', '(&(objectClass=user)(memberOf=CN=door_access,OU=Groups,DC=domain,DC=com))', 'string', 'LDAP user search filter'),
('ldap_sync_interval', '3600', 'number', 'LDAP sync interval in seconds'),
('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications'),
('email_failed_access_enabled', 'true', 'boolean', 'Send emails on failed access attempts'),
('email_no_swipe_out_enabled', 'true', 'boolean', 'Send emails when users do not swipe out');

-- Create door_permissions table for role-based access
CREATE TABLE public.door_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  door_id UUID REFERENCES public.doors(id) ON DELETE CASCADE,
  access_granted BOOLEAN NOT NULL DEFAULT true,
  granted_by UUID REFERENCES public.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(user_id, door_id)
);

-- Add LDAP sync tracking
CREATE TABLE public.ldap_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sync_completed_at TIMESTAMP WITH TIME ZONE,
  users_synced INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'running' CHECK (sync_status IN ('running', 'completed', 'failed')),
  error_details TEXT
);

-- Add user tracking fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ldap_dn TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_door_entry UUID REFERENCES public.doors(id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_entry_time TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.door_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ldap_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for door_permissions
CREATE POLICY "Users can view their own permissions" ON public.door_permissions
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage door permissions" ON public.door_permissions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS policies for ldap_sync_log
CREATE POLICY "Admins can view sync logs" ON public.ldap_sync_log
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create indexes for performance
CREATE INDEX idx_door_permissions_user_id ON public.door_permissions(user_id);
CREATE INDEX idx_door_permissions_door_id ON public.door_permissions(door_id);
CREATE INDEX idx_users_ldap_dn ON public.users(ldap_dn);
CREATE INDEX idx_ldap_sync_log_started_at ON public.ldap_sync_log(sync_started_at);
