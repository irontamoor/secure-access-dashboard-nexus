import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import type { User as UserType } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface CreateUserDialogProps {
  open: boolean;
  setOpen: (b: boolean) => void;
  loading?: boolean;
  onCreate: (data: Omit<UserType, 'id' | 'created_at' | 'updated_at' | 'last_access' | 'last_door_entry' | 'last_entry_time' | 'ldap_dn'>) => Promise<boolean>;
  cardNumber: string;
  setCardNumber: (val: string) => void;
  existingUsers?: UserType[];
}

const initialState = {
  username: '',
  email: '',
  name: '',
  role: 'staff' as 'admin' | 'staff',
  pin: ''
};

type UserFormError = { field: string; message: string };

const CreateUserDialog = ({
  open,
  setOpen,
  loading,
  onCreate,
  cardNumber,
  setCardNumber,
  existingUsers = [],
}: CreateUserDialogProps) => {
  const [fields, setFields] = useState(initialState);
  const [error, setError] = useState<UserFormError | null>(null);
  const { toast } = useToast();

  // Reset cardNumber and fields on dialog open
  useEffect(() => {
    if (!open) {
      setFields(initialState);
      setCardNumber('');
      setError(null);
    }
  }, [open, setCardNumber]);

  const handleGeneratePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setFields(prev => ({ ...prev, pin }));
  };

  // Check uniqueness of card_number among enabled users
  const isCardNumberUnique = (test: string) => {
    return !existingUsers.some(
      (u) => !u.disabled && u.card_number === test
    );
  };

  const handleCreate = async () => {
    setError(null);

    if (!fields.username || !fields.email || !fields.name || !fields.pin) {
      setError({ field: "all", message: "Please fill in all required fields, including PIN." });
      return;
    }
    if (!cardNumber) {
      setError({ field: "card_number", message: "Card number is required." });
      return;
    }
    if (!isCardNumberUnique(cardNumber)) {
      setError({ field: "card_number", message: "This card number is already used by another enabled user." });
      return;
    }

    const success = await onCreate({ ...fields, card_number: cardNumber });
    if (!success) {
      // Error toast handled in parent, but for safety:
      setError({ field: "server", message: "Failed to create user." });
      return;
    }
    setFields(initialState);
    setCardNumber('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              value={fields.username}
              onChange={(e) => setFields(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={fields.email}
              onChange={(e) => setFields(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={fields.name}
              onChange={(e) => setFields(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={fields.role} onValueChange={(value: 'admin' | 'staff') => setFields(prev => ({ ...prev, role: value }))}>
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
                value={fields.pin}
                onChange={(e) => setFields(prev => ({ ...prev, pin: e.target.value.slice(0, 4) }))}
                placeholder="1234"
                maxLength={4}
                required
              />
              <Button type="button" onClick={handleGeneratePin} variant="outline">
                Generate
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="card-number">Card Number</Label>
            <Input
              id="card-number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="Enter card number"
              required
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error.message}</div>
          )}
          <Button onClick={handleCreate} className="w-full" disabled={loading}>
            Create User &amp; Send Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default CreateUserDialog;
