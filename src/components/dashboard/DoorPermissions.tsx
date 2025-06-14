import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Trash2, User, DoorOpen } from 'lucide-react';
import type { User as DBUser, Door as DBDoor, DoorPermission } from '@/types/database';
import PermissionCard from './door-permissions/PermissionCard';
import EmptyPermissionsPlaceholder from './door-permissions/EmptyPermissionsPlaceholder';

export type DoorGroup = {
  id: string;
  name: string;
  description?: string | null;
};

const DoorPermissions = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<DBUser[]>([]);
  const [doors, setDoors] = useState<DBDoor[]>([]);
  const [permissions, setPermissions] = useState<DoorPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doorGroups, setDoorGroups] = useState<DoorGroup[]>([]);

  useEffect(() => {
    loadData();
    loadDoorGroups();
  }, []);

  const loadDoorGroups = async () => {
    const { data, error } = await supabase.from('door_groups').select('*').order('name');
    if (!error && data) setDoorGroups(data);
  };

  const loadData = async () => {
    try {
      const [usersResult, doorsResult, permissionsResult] = await Promise.all([
        supabase.from('users').select('*').order('name'),
        supabase.from('doors').select('*').order('name'),
        supabase.from('door_permissions').select('*').order('granted_at', { ascending: false })
      ]);
      if (usersResult.error) throw usersResult.error;
      if (doorsResult.error) throw doorsResult.error;
      if (permissionsResult.error) throw permissionsResult.error;

      setUsers(usersResult.data.map(user => ({
        ...user,
        role: user.role as 'admin' | 'staff'
      })));
      setDoors(doorsResult.data.map(door => ({
        ...door,
        status: door.status as 'locked' | 'unlocked' | 'maintenance',
        ip_address: typeof door.ip_address === 'string' ? door.ip_address : (door.ip_address === null ? null : String(door.ip_address)),
      })));
      setPermissions(permissionsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load door permissions data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const revokePermission = async (permissionId: string) => {
    try {
      const { error } = await supabase
        .from('door_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      setPermissions(prev => prev.filter(p => p.id !== permissionId));
      toast({
        title: "Permission Revoked",
        description: "Door access permission has been revoked",
      });
    } catch (error) {
      console.error('Error revoking permission:', error);
      toast({
        title: "Error",
        description: "Failed to revoke permission",
        variant: "destructive",
      });
    }
  };

  const getUserById = (uid: string) => users.find(u => u.id === uid);
  const getDoorById = (did: string) => doors.find(d => d.id === did);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading door permissions...</div>;
  }

  const getGroupById = (gid: string | null) =>
    doorGroups.find(g => g.id === gid);

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {permissions.map((permission) => (
          <PermissionCard
            key={permission.id}
            permission={permission}
            user={getUserById(permission.user_id)}
            door={permission.door_id ? getDoorById(permission.door_id) : undefined}
            group={permission.door_group_id ? getGroupById(permission.door_group_id) : undefined}
            onRevoke={revokePermission}
          />
        ))}
        {permissions.length === 0 && (
          <EmptyPermissionsPlaceholder />
        )}
      </div>
    </div>
  );
};

export default DoorPermissions;
