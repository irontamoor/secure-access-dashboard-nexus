
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Settings, Lock, Unlock } from 'lucide-react';

interface Door {
  id: string;
  name: string;
  location: string;
  status: 'locked' | 'unlocked' | 'maintenance';
  lastAccess?: string;
  accessCount: number;
}

const DoorManagement = () => {
  const { toast } = useToast();
  const [doors, setDoors] = useState<Door[]>([
    { id: '1', name: 'Main Entrance', location: 'Ground Floor', status: 'locked', lastAccess: '2024-01-15 14:30', accessCount: 45 },
    { id: '2', name: 'Server Room', location: 'Basement', status: 'locked', lastAccess: '2024-01-15 09:15', accessCount: 3 },
    { id: '3', name: 'Office Wing A', location: '1st Floor', status: 'unlocked', lastAccess: '2024-01-15 16:45', accessCount: 28 },
    { id: '4', name: 'Conference Room', location: '2nd Floor', status: 'locked', lastAccess: '2024-01-15 13:20', accessCount: 12 },
  ]);
  
  const [newDoor, setNewDoor] = useState({
    name: '',
    location: ''
  });
  const [editingDoor, setEditingDoor] = useState<Door | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const createDoor = () => {
    if (!newDoor.name || !newDoor.location) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const door: Door = {
      id: Date.now().toString(),
      ...newDoor,
      status: 'locked',
      accessCount: 0
    };

    setDoors(prev => [...prev, door]);
    setNewDoor({ name: '', location: '' });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Door Created",
      description: `Door "${door.name}" has been added successfully`,
    });
  };

  const updateDoor = () => {
    if (!editingDoor?.name || !editingDoor?.location) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setDoors(prev => prev.map(door => 
      door.id === editingDoor.id ? editingDoor : door
    ));
    
    setEditingDoor(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Door Updated",
      description: `Door "${editingDoor.name}" has been updated successfully`,
    });
  };

  const toggleDoorStatus = (doorId: string) => {
    setDoors(prev => prev.map(door => {
      if (door.id === doorId) {
        const newStatus = door.status === 'locked' ? 'unlocked' : 'locked';
        toast({
          title: `Door ${newStatus}`,
          description: `${door.name} is now ${newStatus}`,
        });
        return { ...door, status: newStatus };
      }
      return door;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'locked': return 'bg-red-100 text-red-800';
      case 'unlocked': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Door Management</h2>
          <p className="text-gray-600">Configure and monitor door access points</p>
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
              <Button onClick={createDoor} className="w-full">
                Create Door
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {doors.map((door) => (
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
                    <h3 className="text-lg font-semibold text-gray-900">{door.name}</h3>
                    <p className="text-gray-600">{door.location}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(door.status)}>
                        {door.status.charAt(0).toUpperCase() + door.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {door.accessCount} accesses today
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm text-gray-500">
                    {door.lastAccess && <p>Last access: {door.lastAccess}</p>}
                  </div>
                  <Button
                    onClick={() => toggleDoorStatus(door.id)}
                    variant={door.status === 'locked' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center space-x-1"
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
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Door</DialogTitle>
            <DialogDescription>
              Update door information
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
