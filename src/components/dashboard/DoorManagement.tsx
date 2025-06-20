import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Lock, Unlock, Network, Ban, Undo2, DeleteIcon } from 'lucide-react';
import type { Door } from '@/types/database';
import DoorDeleteDialog from './user-management/DoorDeleteDialog';

const DoorManagement = () => {
  const { toast } = useToast();
  const [doors, setDoors] = useState<Door[]>([]);
  const [newDoor, setNewDoor] = useState({
    name: '',
    location: '',
    ip_address: ''
  });
  const [editingDoor, setEditingDoor] = useState<Door | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDoors();
  }, []);

  const loadDoors = async () => {
    try {
      const { data, error } = await supabase
        .from('doors')
        .select('*')
        .order('name');

      if (error) throw error;

      // Transform the data to match our Door interface
      const transformedData: Door[] = (data || []).map(door => ({
        ...door,
        ip_address: door.ip_address as string | null,
        access_count: door.access_count || 0,
        status: door.status as 'locked' | 'unlocked' | 'maintenance',
        disabled: !!door.disabled,
      }));

      setDoors(transformedData);
    } catch (error) {
      console.error('Error loading doors:', error);
      toast({
        title: "Error",
        description: "Failed to load doors",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDoor = async () => {
    if (!newDoor.name || !newDoor.location) {
      toast({
        title: "Error",
        description: "Please fill in name and location",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('doors')
        .insert([{
          name: newDoor.name,
          location: newDoor.location,
          ip_address: newDoor.ip_address || null,
          status: 'locked',
          access_count: 0
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedData: Door = {
        ...data,
        ip_address: data.ip_address as string | null,
        access_count: data.access_count || 0,
        status: data.status as 'locked' | 'unlocked' | 'maintenance'
      };

      setDoors(prev => [...prev, transformedData]);
      setNewDoor({ name: '', location: '', ip_address: '' });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Door Created",
        description: `Door "${data.name}" has been added successfully`,
      });
    } catch (error) {
      console.error('Error creating door:', error);
      toast({
        title: "Error",
        description: "Failed to create door",
        variant: "destructive",
      });
    }
  };

  const updateDoor = async () => {
    if (!editingDoor?.name || !editingDoor?.location) {
      toast({
        title: "Error",
        description: "Please fill in name and location",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('doors')
        .update({
          name: editingDoor.name,
          location: editingDoor.location,
          ip_address: editingDoor.ip_address || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingDoor.id)
        .select()
        .single();

      if (error) throw error;

      const transformedData: Door = {
        ...data,
        ip_address: data.ip_address as string | null,
        access_count: data.access_count || 0,
        status: data.status as 'locked' | 'unlocked' | 'maintenance'
      };

      setDoors(prev => prev.map(door => 
        door.id === editingDoor.id ? transformedData : door
      ));
      
      setEditingDoor(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Door Updated",
        description: `Door "${data.name}" has been updated successfully`,
      });
    } catch (error) {
      console.error('Error updating door:', error);
      toast({
        title: "Error",
        description: "Failed to update door",
        variant: "destructive",
      });
    }
  };

  const toggleDoorStatus = async (door: Door) => {
    const newStatus = door.status === 'locked' ? 'unlocked' : 'locked';
    
    try {
      const { data, error } = await supabase
        .from('doors')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', door.id)
        .select()
        .single();

      if (error) throw error;

      const transformedData: Door = {
        ...data,
        ip_address: data.ip_address as string | null,
        access_count: data.access_count || 0,
        status: data.status as 'locked' | 'unlocked' | 'maintenance'
      };

      setDoors(prev => prev.map(d => 
        d.id === door.id ? transformedData : d
      ));

      toast({
        title: `Door ${newStatus}`,
        description: `${door.name} is now ${newStatus}`,
      });
    } catch (error) {
      console.error('Error toggling door status:', error);
      toast({
        title: "Error",
        description: "Failed to update door status",
        variant: "destructive",
      });
    }
  };

  const toggleDoorDisabled = async (door: Door) => {
    try {
      const { error } = await supabase
        .from('doors')
        .update({ disabled: !door.disabled, updated_at: new Date().toISOString() })
        .eq('id', door.id);

      if (error) throw error;

      setDoors(prev =>
        prev.map(d => d.id === door.id ? { ...d, disabled: !door.disabled } : d)
      );

      toast({
        title: !door.disabled ? "Door Disabled" : "Door Restored",
        description: !door.disabled ? `${door.name} is now disabled` : `${door.name} is now active`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update door status",
        variant: "destructive",
      });
    }
  };

  const deleteDoor = async (door) => {
    try {
      const { error } = await supabase
        .from('doors')
        .delete()
        .eq('id', door.id);

      if (error) throw error;

      setDoors(prev => prev.filter(d => d.id !== door.id));
      toast({
        title: "Door Deleted",
        description: `${door.name} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete door",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'locked': return 'bg-red-100 text-red-800';
      case 'unlocked': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading doors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Door Management</h2>
          <p className="text-gray-600">Configure and monitor door access points with IP addresses</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Settings className="w-4 h-4 mr-2" />
              Add Door
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Door</DialogTitle>
              <DialogDescription>
                Create a new door access point
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="doorName">Door Name</Label>
                <Input
                  id="doorName"
                  value={newDoor.name}
                  onChange={(e) => setNewDoor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Entrance"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newDoor.location}
                  onChange={(e) => setNewDoor(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Ground Floor"
                />
              </div>
              <div>
                <Label htmlFor="ipAddress">IP Address (Optional)</Label>
                <Input
                  id="ipAddress"
                  value={newDoor.ip_address}
                  onChange={(e) => setNewDoor(prev => ({ ...prev, ip_address: e.target.value }))}
                  placeholder="e.g., 192.168.1.100"
                />
              </div>
              <Button onClick={createDoor} className="w-full">
                Create Door
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {doors.filter(door => !door.disabled).map((door) => (
          <Card key={door.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {door.status === 'locked' ? (
                      <Lock className="w-6 h-6 text-red-600" />
                    ) : (
                      <Unlock className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {door.name}
                    </h3>
                    <p className="text-gray-600">{door.location}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(door.status)}>
                        {door.status.charAt(0).toUpperCase() + door.status.slice(1)}
                      </Badge>
                      {door.ip_address && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Network className="w-4 h-4" />
                          <span>{door.ip_address}</span>
                        </div>
                      )}
                      <span className="text-sm text-gray-500">
                        {door.access_count || 0} accesses
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 min-w-[120px]">
                  <div className="text-right text-sm text-gray-500">
                    {door.last_access && <p>Last access: {new Date(door.last_access).toLocaleString()}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => toggleDoorStatus(door)}
                      variant={door.status === 'locked' ? 'default' : 'outline'}
                      size="sm"
                      className="flex items-center space-x-1"
                      disabled={door.disabled}
                    >
                      {door.status === 'locked' ? (
                        <>
                          <Unlock className="w-4 h-4" />
                          <span>Unlock</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Lock</span>
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingDoor(door);
                        setIsEditDialogOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      disabled={door.disabled}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => toggleDoorDisabled(door)}
                      variant={door.disabled ? 'outline' : 'destructive'}
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      {door.disabled ? (
                        <>
                          <Undo2 className="w-4 h-4" />
                          <span>Enable</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4" />
                          <span>Disable</span>
                        </>
                      )}
                    </Button>
                  </div>
                  {door.disabled && (
                    <Badge variant="destructive" className="mt-2">Disabled</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {doors.filter(door => door.disabled).length > 0 && (
          <>
            <div className="mt-8 text-gray-600 text-sm">Disabled Doors</div>
            {doors.filter(door => door.disabled).map((door) => (
              <Card key={door.id} className="bg-white/40 border-dashed border-2 border-red-300">
                <CardContent className="p-6 flex items-center justify-between opacity-50">
                  <div>
                    <h3 className="font-semibold">{door.name}</h3>
                    <p className="text-gray-500">{door.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleDoorDisabled(door)}
                      size="sm"
                      variant="outline"
                    >
                      <Undo2 className="w-4 h-4 mr-1" /> Enable
                    </Button>
                    <DoorDeleteDialog onDelete={() => deleteDoor(door)}>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex items-center space-x-2"
                      >
                        <DeleteIcon className="w-5 h-5" />
                        <span>Delete</span>
                      </Button>
                    </DoorDeleteDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Door</DialogTitle>
            <DialogDescription>
              Update door information and IP address
            </DialogDescription>
          </DialogHeader>
          {editingDoor && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editDoorName">Door Name</Label>
                <Input
                  id="editDoorName"
                  value={editingDoor.name}
                  onChange={(e) => setEditingDoor(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="e.g., Main Entrance"
                />
              </div>
              <div>
                <Label htmlFor="editLocation">Location</Label>
                <Input
                  id="editLocation"
                  value={editingDoor.location}
                  onChange={(e) => setEditingDoor(prev => prev ? { ...prev, location: e.target.value } : null)}
                  placeholder="e.g., Ground Floor"
                />
              </div>
              <div>
                <Label htmlFor="editIpAddress">IP Address</Label>
                <Input
                  id="editIpAddress"
                  value={editingDoor.ip_address || ''}
                  onChange={(e) => setEditingDoor(prev => prev ? { ...prev, ip_address: e.target.value } : null)}
                  placeholder="e.g., 192.168.1.100"
                />
              </div>
              <Button onClick={updateDoor} className="w-full">
                Update Door
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoorManagement;
// NOTE: This file is now quite large (473+ lines). Please consider refactoring into smaller files for maintainability.
