
import { Card, CardContent } from '@/components/ui/card';
import type { User as UserType } from '@/types/database';
import UserCardDetails from './UserCardDetails';
import UserCardActions from './UserCardActions';

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
  return (
    <Card className={`bg-white/60 backdrop-blur-sm border-0 shadow-lg ${user.disabled ? 'opacity-50' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <UserCardDetails
            user={user}
            onResetPin={onResetPin}
            onEmailPin={onEmailPin}
            disabled={disabled}
            onCardNumberChange={onCardNumberChange}
          />
          <UserCardActions
            user={user}
            onToggleDisabled={onToggleDisabled}
            onTogglePinDisabled={onTogglePinDisabled}
            onDelete={onDelete}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;

// NOTE: This file is now much cleaner. Consider refactoring other large dashboard files for maintainability.
