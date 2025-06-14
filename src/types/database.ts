
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  pin: string;
  created_at: string;
  updated_at: string;
  last_access?: string;
}

export interface Door {
  id: string;
  name: string;
  location: string;
  ip_address?: string;
  status: 'locked' | 'unlocked' | 'maintenance';
  access_count: number;
  created_at: string;
  updated_at: string;
  last_access?: string;
}

export interface AccessLog {
  id: string;
  user_id?: string;
  door_id?: string;
  access_type: 'granted' | 'denied' | 'manual_unlock' | 'manual_lock';
  pin_used?: string;
  ip_address?: string;
  timestamp: string;
  notes?: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value?: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  updated_at: string;
  updated_by?: string;
}
