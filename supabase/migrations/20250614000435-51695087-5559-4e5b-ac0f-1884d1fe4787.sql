
-- Create tables for the door access system

-- Users table for authentication and user management
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  pin TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_access TIMESTAMP WITH TIME ZONE
);

-- Doors table
CREATE TABLE public.doors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  ip_address INET,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'maintenance')),
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_access TIMESTAMP WITH TIME ZONE
);

-- Access logs table
CREATE TABLE public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  door_id UUID REFERENCES public.doors(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('granted', 'denied', 'manual_unlock', 'manual_lock')),
  pin_used TEXT,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- System settings table for SMTP and other configurations
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT NOT NULL DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.users(id)
);

-- Insert default SMTP settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES
('smtp_host', '', 'string', 'SMTP server hostname'),
('smtp_port', '587', 'number', 'SMTP server port'),
('smtp_username', '', 'string', 'SMTP username'),
('smtp_password', '', 'string', 'SMTP password'),
('smtp_from_email', '', 'string', 'From email address'),
('smtp_from_name', 'Door Access System', 'string', 'From name'),
('smtp_use_tls', 'true', 'boolean', 'Use TLS encryption'),
('local_admin_enabled', 'true', 'boolean', 'Enable local admin access'),
('local_admin_username', 'localadmin', 'string', 'Local admin username'),
('local_admin_password', 'admin123', 'string', 'Local admin password');

-- Create indexes for better performance
CREATE INDEX idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX idx_access_logs_door_id ON public.access_logs(door_id);
CREATE INDEX idx_access_logs_timestamp ON public.access_logs(timestamp);
CREATE INDEX idx_users_role ON public.users(role);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (true); -- We'll handle this in the application logic

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (true); -- We'll handle this in the application logic

-- RLS Policies for doors table
CREATE POLICY "Everyone can view doors" ON public.doors
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage doors" ON public.doors
  FOR ALL USING (true);

-- RLS Policies for access_logs table
CREATE POLICY "Users can view logs" ON public.access_logs
  FOR SELECT USING (true);

CREATE POLICY "System can insert logs" ON public.access_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for system_settings table
CREATE POLICY "Admins can manage settings" ON public.system_settings
  FOR ALL USING (true);
