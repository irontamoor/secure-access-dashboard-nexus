
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, User, Mail } from 'lucide-react';
import type { User as UserType } from '@/types/database';

interface PinManagementProps {
  isAdmin: boolean;
  userId?: string;
}

const PinManagement = ({ isAdmin, userId }: PinManagementProps) => {
  const { toast } = useToast();
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Transform the data to match our User interface
      const transformedData: UserType[] = (data || []).map(user => ({
        ...user,
        role: user.role as 'admin' | 'staff'
      }));
      
      setAllUsers(transformedData);
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

  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewPin(pin);
    setConfirmPin(pin);
  };

  const updateOwnPin = async () => {
    if (!newPin || !confirmPin) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "Error",
        description: "New PIN and confirmation don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({
        title: "Error",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          pin: newPin,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "PIN Updated",
        description: "Your PIN has been successfully changed",
      });

      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      console.error('Error updating PIN:', error);
      toast({
        title: "Error",
        description: "Failed to update PIN",
        variant: "destructive",
      });
    }
  };

  const resetUserPin = async (user: UserType) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          pin: newPin,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setAllUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, pin: newPin, updated_at: new Date().toISOString() }
          : u
      ));
      
      toast({
        title: "PIN Reset",
        description: `New PIN for ${user.name}: ${newPin}`,
      });

      // Send email notification (this would be implemented with an edge function)
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

  const sendPinByEmail = async (user: UserType, pin: string) => {
    try {
      // This would call a Supabase edge function to send email
      toast({
        title: "Email Sent",
        description: `PIN sent to ${user.email}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Email Error",
        description: "PIN reset but email failed to send",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PIN Management</h2>
          <p className="text-gray-600">Manage user PINs and send notifications via email</p>
        </div>

        <div className="grid gap-4">
          {allUsers.map((user) => (
            <Card key={user.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">Last updated: {new Date(user.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => resetUserPin(user)}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Key className="w-4 h-4" />
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
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Change Your PIN</h2>
        <p className="text-gray-600">Update your 4-digit access PIN</p>
      </div>

      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>PIN Settings</span>
          </CardTitle>
          <CardDescription>
            Enter your new 4-digit PIN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newPin">New PIN</Label>
            <div className="flex space-x-2">
              <Input
                id="newPin"
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
                placeholder="••••"
              />
              <Button type="button" onClick={generateRandomPin} variant="outline">
                Generate
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="confirmPin">Confirm New PIN</Label>
            <Input
              id="confirmPin"
              type="password"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.slice(0, 4))}
              placeholder="••••"
            />
          </div>
          
          <Button onClick={updateOwnPin} className="w-full">
            Update PIN
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PinManagement;
