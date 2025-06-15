import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Settings, User, Mail, Ban, Undo2 } from 'lucide-react';
import type { User as UserType } from '@/types/database';
import UserCard from './user-management/UserCard';
import CreateUserDialog from './user-management/CreateUserDialog';
import { useUsers } from './user-management/useUsers';
import UserList from './user-management/UserList';

// Remove state and functions now handled in the new hook/component
const UserManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    name: '',
    role: 'staff' as 'admin' | 'staff',
    pin: '',
    card_number: ''
  });

  const {
    users,
    loading,
    loadUsers,
    createUser,
    updateUserCardNumber,
    resetUserPin,
    toggleUserDisabled,
    togglePinDisabled,
    deleteUser
  } = useUsers();

  useEffect(() => {
    loadUsers();
  }, []);

  const generatePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewUser(prev => ({ ...prev, pin }));
  };

  const sendWelcomeEmail = async (user: any) => {
    // Placeholder for sending email logic (if needed)
  };
  const sendPinByEmail = async (user: any, pin: string) => {
    // Placeholder for sending email logic (if needed)
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Create and manage user accounts with automatic email notifications and PIN settings</p>
        </div>
        <CreateUserDialog
          open={isCreateDialogOpen}
          setOpen={setIsCreateDialogOpen}
          onCreate={async (userInfo) => {
            const success = await createUser(userInfo);
            if (success) setIsCreateDialogOpen(false);
          }}
          cardNumber={newUser.card_number}
          setCardNumber={val => setNewUser(prev => ({ ...prev, card_number: val }))}
          existingUsers={users}
        />
      </div>
      <UserList
        users={users}
        onResetPin={resetUserPin}
        onEmailPin={user => sendPinByEmail(user, user.pin)}
        onToggleDisabled={toggleUserDisabled}
        onTogglePinDisabled={togglePinDisabled}
        onDelete={deleteUser}
        onCardNumberChange={updateUserCardNumber}
      />
    </div>
  );
};

export default UserManagement;
