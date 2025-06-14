
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Plus, Trash2, User, DoorOpen } from 'lucide-react';
import type { User as DBUser, Door as DBDoor, DoorPermission } from '@/types/database';

const DoorPermissions = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<DBUser[]>([]);
  const [doors, setDoors] = useState<DBDoor[]>([]);
  const [permissions, setPermissions] = useState<DoorPermission[]>([]);
  const [newPermission, setNewPermission] = useState({
    user_id: '',
    door_id: '',
    expires_at: '',
    notes: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
        ip_address: (typeof door.ip_address === 'string' || door.ip_address === null) ? door.ip_address : null,
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

  const createPermission = async () => {
    if (!newPermission.user_id || !newPermission.door_id) {
      toast({
        title: "Error",
        description: "Please select both user and door",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('door_permissions')
        .insert([{
          user_id: newPermission.user_id,
          door_id: newPermission.door_id,
          access_granted: true,
          expires_at: newPermission.expires_at || null,
          notes: newPermission.notes || null
        }])
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          title: "Error",
          description: "Permission was not returned from server",
          variant: "destructive"
        });
        return;
      }

      setPermissions(prev => [data, ...prev]);
      setNewPermission({ user_id: '', door_id: '', expires_at: '', notes: '' });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Permission Created",
        description: "Door access permission has been granted successfully",
      });
    } catch (error) {
      console.error('Error creating permission:', error);
      toast({
        title: "Error",
        description: "Failed to create door permission",
        variant: "destructive",
      });
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

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading door permissions...</div>;
  }

  const getUserById = (uid: string) => users.find(u => u.id === uid);
  const getDoorById = (did: string) => doors.find(d => d.id === did);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Door Permissions</h2>
          <p className="text-gray-600">Manage role-based access control for doors</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Grant Access
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant Door Access</DialogTitle>
              <DialogDescription>
                Grant a user access to a specific door
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user">User</Label>
                <Select value={newPermission.user_id} onValueChange={(value) => setNewPermission(prev => ({ ...prev, user_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} (@{user.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="door">Door</Label>
                <Select value={newPermission.door_id} onValueChange={(value) => setNewPermission(prev => ({ ...prev, door_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select door" />
                  </SelectTrigger>
                  <SelectContent>
                    {doors.map((door) => (
                      <SelectItem key={door.id} value={door.id}>
                        {door.name} - {door.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={newPermission.expires_at}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={newPermission.notes}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                />
              </div>
              <Button onClick={createPermission} className="w-full">
                Grant Access
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {permissions.map((permission) => {
          const user = getUserById(permission.user_id);
          const door = getDoorById(permission.door_id);
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
                        <span>{door ? `${door.name} - ${door.location}` : "Unknown door"}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={permission.access_granted ? 'default' : 'destructive'}>
                          {permission.access_granted ? 'Granted' : 'Denied'}
                        </Badge>
                        {permission.expires_at && (
                          <Badge variant={isExpired(permission.expires_at) ? 'destructive' : 'secondary'}>
                            {isExpired(permission.expires_at) ? 'Expired' : 'Expires'}: {new Date(permission.expires_at).toLocaleDateString()}
                          </Badge>
                        )}
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
                    <Button
                      onClick={() => revokePermission(permission.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Revoke</span>
                    </Button>
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
