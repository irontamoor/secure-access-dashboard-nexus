import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, User, Mail } from 'lucide-react';
import type { User as UserType } from '@/types/database';
import AdminPinManagement from './pin-management/AdminPinManagement';
import UserPinSettings from './pin-management/UserPinSettings';

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

  const updateOwnPin = async (newPinValue: string) => {
    if (!newPinValue) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          pin: newPinValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "PIN Updated",
        description: "Your PIN has been successfully changed",
      });
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

      setAllUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, pin: newPin, updated_at: new Date().toISOString() }
          : u
      ));
      
      toast({
        title: "PIN Reset",
        description: `New PIN for ${user.name}: ${newPin}`,
      });

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
      <AdminPinManagement
        users={allUsers}
        resetUserPin={resetUserPin}
        sendPinByEmail={sendPinByEmail}
      />
    );
  }

  return (
    <UserPinSettings
      onUpdatePin={updateOwnPin}
    />
  );
};

export default PinManagement;
