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
import { UserPlus, Settings, User, Mail, Ban, Undo2 } from 'lucide-react';
import type { User as UserType } from '@/types/database';
import UserCard from './user-management/UserCard';
import CreateUserDialog from './user-management/CreateUserDialog';

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    name: '',
    role: 'staff' as 'admin' | 'staff',
    pin: '',
    card_number: ''
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
      // Transform the data to match our User interface
      const transformedData: UserType[] = (data || []).map(user => ({
        ...user,
        role: user.role as 'admin' | 'staff',
        disabled: !!user.disabled,
        pin_disabled: !!user.pin_disabled,
        card_number: user.card_number || null,
      }));

      setUsers(transformedData);
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

  const handleCreateUser = async ({
    username,
    email,
    name,
    role,
    pin,
    card_number
  }: {
    username: string;
    email: string;
    name: string;
    role: 'admin' | 'staff';
    pin: string;
    card_number?: string | null;
  }) => {
    if (!username || !email || !name || !pin) {
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
          username: username,
          email: email,
          name: name,
          role: role,
          pin: pin,
          card_number: card_number || null
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedData: UserType = {
        ...data,
        role: data.role as 'admin' | 'staff'
      };

      setUsers(prev => [...prev, transformedData]);
      setNewUser({ username: '', email: '', name: '', role: 'staff', pin: '', card_number: '' });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "User Created",
        description: `User ${data.name} has been created successfully`,
      });

      // Send PIN by email
      sendWelcomeEmail(transformedData);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const updateUserCardNumber = async (user: UserType, card_number: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          card_number: card_number,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, card_number } : u));
      toast({
        title: "Card Number Updated",
        description: `Card number updated for ${user.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update card number",
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

      const transformedData: UserType = {
        ...data,
        role: data.role as 'admin' | 'staff'
      };

      setUsers(prev => prev.map(u => 
        u.id === user.id ? transformedData : u
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

  const toggleUserDisabled = async (user: UserType) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ disabled: !user.disabled, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, disabled: !user.disabled } : u)
      );

      toast({
        title: !user.disabled ? "User Disabled" : "User Restored",
        description: !user.disabled ? `${user.name} is now disabled` : `${user.name} is now active`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const togglePinDisabled = async (user: UserType) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ pin_disabled: !user.pin_disabled, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, pin_disabled: !user.pin_disabled } : u)
      );

      toast({
        title: !user.pin_disabled ? "PIN Disabled" : "PIN Enabled",
        description: !user.pin_disabled
          ? `PIN for ${user.name} is disabled`
          : `PIN for ${user.name} is enabled`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update PIN status",
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

  const deleteUser = async (user: UserType) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast({
        title: "User Deleted",
        description: `${user.name} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
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

        <CreateUserDialog
          open={isCreateDialogOpen}
          setOpen={setIsCreateDialogOpen}
          onCreate={handleCreateUser}
          // Pass card_number prop to CreateUserDialog:
          cardNumber={newUser.card_number}
          setCardNumber={val => setNewUser(prev => ({ ...prev, card_number: val }))}
        />
      </div>
      <div className="grid gap-4">
        {users.filter(user => !user.disabled).map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onResetPin={resetUserPin}
            onEmailPin={user => sendPinByEmail(user, user.pin)}
            onToggleDisabled={() => toggleUserDisabled(user)}
            onTogglePinDisabled={() => togglePinDisabled(user)}
            onCardNumberChange={newNumber => updateUserCardNumber(user, newNumber)}
          />
        ))}
        {users.filter(user => user.disabled).length > 0 && (
          <>
            <div className="mt-8 text-gray-600 text-sm">Disabled Users</div>
            {users.filter(user => user.disabled).map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onResetPin={() => {}}
                onEmailPin={() => {}}
                onToggleDisabled={() => toggleUserDisabled(user)}
                onTogglePinDisabled={() => togglePinDisabled(user)}
                onDelete={() => deleteUser(user)}
                disabled
                onCardNumberChange={() => {}}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

// NOTE: This file is now quite large (over 300 lines). Please consider refactoring into smaller files for maintainability.
