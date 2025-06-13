
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Settings, User } from 'lucide-react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  name: string;
  pin: string;
  createdAt: string;
  lastAccess?: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', role: 'admin', name: 'Administrator', pin: '1234', createdAt: '2024-01-01', lastAccess: '2024-01-15' },
    { id: '2', username: 'staff1', role: 'staff', name: 'John Doe', pin: '5678', createdAt: '2024-01-05', lastAccess: '2024-01-15' },
    { id: '3', username: 'staff2', role: 'staff', name: 'Jane Smith', pin: '9876', createdAt: '2024-01-10', lastAccess: '2024-01-14' },
  ]);
  
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    role: 'staff' as 'admin' | 'staff',
    pin: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const generatePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewUser(prev => ({ ...prev, pin }));
  };

  const createUser = () => {
    if (!newUser.username || !newUser.name || !newUser.pin) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      ...newUser,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, user]);
    setNewUser({ username: '', name: '', role: 'staff', pin: '' });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "User Created",
      description: `User ${user.name} has been created successfully`,
    });
  };

  const resetUserPin = (userId: string) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, pin: newPin } : user
    ));
    
    toast({
      title: "PIN Reset",
      description: `New PIN generated: ${newPin}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Create and manage user accounts</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the access control system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value: 'admin' | 'staff') => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pin">4-Digit PIN</Label>
                <div className="flex space-x-2">
                  <Input
                    id="pin"
                    value={newUser.pin}
                    onChange={(e) => setNewUser(prev => ({ ...prev, pin: e.target.value.slice(0, 4) }))}
                    placeholder="1234"
                    maxLength={4}
                  />
                  <Button type="button" onClick={generatePin} variant="outline">
                    Generate
                  </Button>
                </div>
              </div>
              <Button onClick={createUser} className="w-full">
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600">@{user.username}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">PIN: ••••</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm text-gray-500">
                    <p>Created: {user.createdAt}</p>
                    {user.lastAccess && <p>Last access: {user.lastAccess}</p>}
                  </div>
                  <Button
                    onClick={() => resetUserPin(user.id)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Reset PIN</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
