
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Settings, Mail } from 'lucide-react';
import type { User as UserType } from '@/types/database';

interface UserCardProps {
  user: UserType;
  onResetPin: (u: UserType) => void;
  onEmailPin: (u: UserType) => void;
}

const UserCard = ({ user, onResetPin, onEmailPin }: UserCardProps) => (
  <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-gray-600">@{user.username}</p>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right text-sm text-gray-500">
            <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>
            {user.last_access && <p>Last access: {new Date(user.last_access).toLocaleDateString()}</p>}
          </div>
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
      </div>
    </CardContent>
  </Card>
);

export default UserCard;
