
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
  ldap_dn?: string | null;
  last_door_entry?: string | null;
  last_entry_time?: string | null;
  disabled?: boolean;
  pin_disabled?: boolean;
  card_number?: string | null; // <-- Added card_number
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
  disabled?: boolean; // newly added property
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

export interface DoorPermission {
  id: string;
  user_id: string;
  door_id: string | null;
  access_granted: boolean;
  granted_by?: string | null;
  granted_at: string;
  expires_at?: string | null;
  notes?: string | null;
  all_doors: boolean;
  door_group_id: string | null;
}

export interface LdapSyncLog {
  id: string;
  sync_started_at: string;
  sync_completed_at?: string | null;
  users_synced?: number | null;
  errors_count?: number | null;
  sync_status: 'running' | 'completed' | 'failed';
  error_details?: string | null;
}
