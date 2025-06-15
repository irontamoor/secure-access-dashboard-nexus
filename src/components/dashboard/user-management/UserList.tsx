
import UserCard from "./UserCard";
import type { User as UserType } from '@/types/database';

interface UserListProps {
  users: UserType[];
  onResetPin: (u: UserType) => void;
  onEmailPin: (u: UserType) => void;
  onToggleDisabled: (u: UserType) => void;
  onTogglePinDisabled: (u: UserType) => void;
  onDelete?: (u: UserType) => void;
  onCardNumberChange: (u: UserType, cardNumber: string) => void;
}

const UserList = ({
  users,
  onResetPin,
  onEmailPin,
  onToggleDisabled,
  onTogglePinDisabled,
  onDelete,
  onCardNumberChange,
}: UserListProps) => (
  <>
    {users.filter(user => !user.disabled).map((user) => (
      <UserCard
        key={user.id}
        user={user}
        onResetPin={onResetPin}
        onEmailPin={onEmailPin}
        onToggleDisabled={() => onToggleDisabled(user)}
        onTogglePinDisabled={() => onTogglePinDisabled(user)}
        onCardNumberChange={newNumber => onCardNumberChange(user, newNumber)}
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
            onToggleDisabled={() => onToggleDisabled(user)}
            onTogglePinDisabled={() => onTogglePinDisabled(user)}
            onDelete={onDelete ? () => onDelete(user) : undefined}
            disabled
            onCardNumberChange={() => {}}
          />
        ))}
      </>
    )}
  </>
);

export default UserList;
