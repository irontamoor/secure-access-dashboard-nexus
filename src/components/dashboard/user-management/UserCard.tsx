import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Settings, Mail, Ban, Undo2, Key, Delete as DeleteIcon } from 'lucide-react';
import type { User as UserType } from '@/types/database';
import UserDeleteDialog from './UserDeleteDialog';
import { useState } from 'react';

interface UserCardProps {
  user: UserType;
  onResetPin: (u: UserType) => void;
  onEmailPin: (u: UserType) => void;
  onToggleDisabled?: () => void;
  onTogglePinDisabled?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  onCardNumberChange?: (newNumber: string) => void;
}

const UserCard = ({
  user,
  onResetPin,
  onEmailPin,
  onToggleDisabled,
  onTogglePinDisabled,
  onDelete,
  disabled,
  onCardNumberChange,
}: UserCardProps & { onDelete?: () => void }) => {
  const [editingCard, setEditingCard] = useState(false);
  const [cardInput, setCardInput] = useState(user.card_number || '');

  const saveEdit = () => {
    if (onCardNumberChange && cardInput !== user.card_number) {
      onCardNumberChange(cardInput);
    }
    setEditingCard(false);
  };

  return (
    <Card className={`bg-white/60 backdrop-blur-sm border-0 shadow-lg ${user.disabled ? 'opacity-50' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.name}
                {user.disabled && (
                  <Badge variant="destructive" className="ml-2">Disabled</Badge>
                )}
                {!user.disabled && user.pin_disabled && (
                  <Badge variant="secondary" className="ml-2 text-xs">PIN Disabled</Badge>
                )}
              </h3>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">Card Number:</span>
                {editingCard && !user.disabled ? (
                  <>
                    <input
                      className="border rounded px-2 py-1 text-sm w-36"
                      value={cardInput}
                      onChange={e => setCardInput(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); }}
                      autoFocus
                    />
                    <Button size="sm" variant="outline" onClick={saveEdit}>Save</Button>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-blue-700">{user.card_number || "—"}</span>
                    {!user.disabled && onCardNumberChange && (
                      <Button size="sm" variant="ghost" onClick={() => setEditingCard(true)}>
                        Edit
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2 min-w-[100px]">
            <div className="text-right text-sm text-gray-500 mb-1">
              <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>
              {user.last_access && <p>Last access: {new Date(user.last_access).toLocaleDateString()}</p>}
            </div>
            {!user.disabled && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onResetPin(user)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                  disabled={user.pin_disabled}
                >
                  <Settings className="w-4 h-4" />
                  <span>Reset PIN</span>
                </Button>
                <Button
                  onClick={() => onEmailPin(user)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                  disabled={user.pin_disabled}
                >
                  <Mail className="w-4 h-4" />
                  <span>Email PIN</span>
                </Button>
              </div>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <Button
                onClick={onToggleDisabled}
                variant={user.disabled ? 'outline' : 'destructive'}
                size="sm"
                className="flex items-center space-x-1"
              >
                {user.disabled ? (
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
              {!user.disabled && (
                <Button
                  onClick={onTogglePinDisabled}
                  variant={user.pin_disabled ? 'outline' : 'secondary'}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Key className="w-4 h-4" />
                  <span>{user.pin_disabled ? 'Enable PIN' : 'Disable PIN'}</span>
                </Button>
              )}
              {user.disabled && onDelete && (
                <UserDeleteDialog onDelete={onDelete}>
                  <Button 
                    size="sm"
                    variant="destructive"
                    className="flex items-center space-x-2"
                  >
                    <DeleteIcon className="w-5 h-5" />
                    <span>Delete</span>
                  </Button>
                </UserDeleteDialog>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
