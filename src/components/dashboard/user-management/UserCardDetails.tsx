
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Settings, Mail } from 'lucide-react';
import type { User as UserType } from '@/types/database';
import { useState } from 'react';

interface UserCardDetailsProps {
  user: UserType;
  onResetPin: (u: UserType) => void;
  onEmailPin: (u: UserType) => void;
  disabled?: boolean;
  onCardNumberChange?: (newNumber: string) => void;
}

const UserCardDetails = ({
  user,
  onResetPin,
  onEmailPin,
  disabled,
  onCardNumberChange,
}: UserCardDetailsProps) => {
  const [editingCard, setEditingCard] = useState(false);
  const [cardInput, setCardInput] = useState(user.card_number || '');

  const saveEdit = () => {
    if (onCardNumberChange && cardInput !== user.card_number) {
      onCardNumberChange(cardInput);
    }
    setEditingCard(false);
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
        <UserIcon className="w-5 h-5 text-gray-600" />
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
        {/* Card Number section only */}
        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Card Number:</span>
            {editingCard && !user.disabled ? (
              <>
                <input
                  className="border rounded px-2 py-1 text-sm w-32"
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
          {/* Remove PIN UI - only Card Number remains */}
          {!user.disabled && !user.pin_disabled && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onResetPin(user)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Settings className="w-4 h-4" />
                <span>Reset PIN</span>
              </Button>
              <Button
                onClick={() => onEmailPin(user)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Mail className="w-4 h-4" />
                <span>Email PIN</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCardDetails;
