
import { useState, useEffect } from 'react';
import { Card, CardContent, Badge } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Trash2, User, DoorOpen } from 'lucide-react';
import type { User as DBUser, Door as DBDoor, DoorPermission } from '@/types/database';

type DoorGroup = {
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

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading door permissions...</div>;
  }

  const getUserById = (uid: string) => users.find(u => u.id === uid);
  const getDoorById = (did: string) => doors.find(d => d.id === did);

  const getPermissionTarget = (perm: DoorPermission) => {
    if (perm.door_group_id) {
      const group = doorGroups.find(g => g.id === perm.door_group_id);
      return { type: 'door_group', label: group ? `Group: ${group.name}` : "Group (unknown)" };
    }
    if (perm.door_id) {
      const door = getDoorById(perm.door_id);
      return { type: 'door', label: door ? `Door: ${door.name}` : "Door (unknown)" };
    }
    return { type: 'unknown', label: 'Unknown' };
  };

  return (
    <div className="space-y-6">
      {/* Removed Grant Access button, dialog, and placeholder */}
      <div className="grid gap-4">
        {permissions.map((permission) => {
          const user = getUserById(permission.user_id);
          const target = getPermissionTarget(permission);
          return (
            <Card key={permission.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">{user ? user.name : "Unknown"}</span>
                        <span className="text-gray-500">@{user ? user.username : ""}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <DoorOpen className="w-4 h-4 text-gray-500" />
                        <span>{target.type === 'door' && doors.find(d => d.id === permission.door_id) ? `${doors.find(d => d.id === permission.door_id)?.name} - ${doors.find(d => d.id === permission.door_id)?.location}` : target.type === 'door_group' ? (doorGroups.find(g => g.id === permission.door_group_id)?.name || "Unknown group") : "Unknown"}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{target.label}</Badge>
                      </div>
                      {permission.notes && (
                        <p className="text-sm text-gray-600 mt-1">{permission.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm text-gray-500">
                      <p>Granted: {new Date(permission.granted_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => revokePermission(permission.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 border border-red-300 rounded px-2 py-1 text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Revoke</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {permissions.length === 0 && (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Permissions Set</h3>
              <p className="text-gray-600">Get started by granting door access to users</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DoorPermissions;

