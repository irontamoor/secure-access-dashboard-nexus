
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  pin: string;
  created_at: string;
  updated_at: string;
  last_access?: string | null;
}

export interface Door {
  id: string;
  name: string;
  location: string;
  ip_address?: string | null;
  status: 'locked' | 'unlocked' | 'maintenance';
  access_count: number | null;
  created_at: string;
  updated_at: string;
  last_access?: string | null;
}

export interface AccessLog {
  id: string;
  user_id?: string | null;
  door_id?: string | null;
  access_type: 'granted' | 'denied' | 'manual_unlock' | 'manual_lock';
  pin_used?: string | null;
  ip_address?: string | null;
  timestamp: string;
  notes?: string | null;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value?: string | null;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string | null;
  updated_at: string;
  updated_by?: string | null;
}
