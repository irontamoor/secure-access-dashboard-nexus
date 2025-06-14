
import { Button } from '@/components/ui/button';
import { Undo2, Ban, Key, Delete as DeleteIcon } from 'lucide-react';
import { User as UserType } from '@/types/database';
import UserDeleteDialog from './UserDeleteDialog';

interface UserCardActionsProps {
  user: UserType;
  onToggleDisabled?: () => void;
  onTogglePinDisabled?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const UserCardActions = ({
  user,
  onToggleDisabled,
  onTogglePinDisabled,
  onDelete,
  disabled,
}: UserCardActionsProps) => {
  return (
    <div className="flex flex-col items-end space-y-2 min-w-[100px]">
      <div className="text-right text-sm text-gray-500 mb-1">
        <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>
        {user.last_access && <p>Last access: {new Date(user.last_access).toLocaleDateString()}</p>}
      </div>
      {!user.disabled && (
        <div className="flex items-center space-x-2">
          {/* No PIN management buttons on the right anymore, only disable/enable etc */}
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
  );
};

export default UserCardActions;
