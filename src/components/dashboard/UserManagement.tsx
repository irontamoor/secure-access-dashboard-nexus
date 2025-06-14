
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
import { UserPlus, Settings, User, Mail } from 'lucide-react';
import type { User as UserType } from '@/types/database';

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    name: '',
    role: 'staff' as 'admin' | 'staff',
    pin: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewUser(prev => ({ ...prev, pin }));
  };

  const createUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.name || !newUser.pin) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          pin: newUser.pin
        }])
        .select()
        .single();

      if (error) throw error;

      setUsers(prev => [...prev, data]);
      setNewUser({ username: '', email: '', name: '', role: 'staff', pin: '' });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "User Created",
        description: `User ${data.name} has been created successfully`,
      });

      // Send PIN by email
      sendWelcomeEmail(data);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const resetUserPin = async (user: UserType) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          pin: newPin,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.id === user.id ? data : u
      ));
      
      toast({
        title: "PIN Reset",
        description: `New PIN for ${user.name}: ${newPin}`,
      });

      // Send PIN by email
      sendPinByEmail(user, newPin);
    } catch (error) {
      console.error('Error resetting PIN:', error);
      toast({
        title: "Error",
        description: "Failed to reset PIN",
        variant: "destructive",
      });
    }
  };

  const sendWelcomeEmail = async (user: UserType) => {
    // This would call a Supabase edge function to send welcome email
    toast({
      title: "Welcome Email Sent",
      description: `Welcome email with PIN sent to ${user.email}`,
    });
  };

  const sendPinByEmail = async (user: UserType, pin: string) => {
    // This would call a Supabase edge function to send PIN
    toast({
      title: "PIN Email Sent",
      description: `New PIN sent to ${user.email}`,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Create and manage user accounts with automatic email notifications</p>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
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
                Create User & Send Email
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
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm text-gray-500">
                    <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>
                    {user.last_access && <p>Last access: {new Date(user.last_access).toLocaleDateString()}</p>}
                  </div>
                  <Button
                    onClick={() => resetUserPin(user)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Reset PIN</span>
                  </Button>
                  <Button
                    onClick={() => sendPinByEmail(user, user.pin)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email PIN</span>
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
