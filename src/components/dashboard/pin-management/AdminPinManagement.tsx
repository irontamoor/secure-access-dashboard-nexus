
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Key, Mail, Ban, Undo2 } from 'lucide-react';
import type { User as UserType } from '@/types/database';

interface AdminPinManagementProps {
  users: UserType[];
  resetUserPin: (user: UserType) => void;
  sendPinByEmail: (user: UserType, pin: string) => void;
}

const AdminPinManagement = ({ users, resetUserPin, sendPinByEmail }: AdminPinManagementProps) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">PIN Management</h2>
      <p className="text-gray-600">Manage user PINs and send notifications via email</p>
    </div>

    <div className="grid gap-4">
      {users.map((user) => (
        <Card key={user.id} className={`bg-white/60 backdrop-blur-sm border-0 shadow-lg ${user.pin_disabled ? 'opacity-50' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name}
                    {user.pin_disabled && <span className="ml-2 text-xs text-red-500">(PIN Disabled)</span>}
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">Last updated: {new Date(user.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => resetUserPin(user)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                  disabled={user.pin_disabled}
                >
                  <Key className="w-4 h-4" />
                  <span>Reset PIN</span>
                </Button>
                <Button
                  onClick={() => sendPinByEmail(user, user.pin!)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                  disabled={user.pin_disabled}
                >
                  <Mail className="w-4 h-4" />
                  <span>Email PIN</span>
                </Button>
                <Button
                  onClick={async () => {
                    // Toggle pin_disabled. This is only for UI; real logic should be unified.
                    // In practice, AdminPinManagement should receive a callback to update pin_disabled.
                    // For now we just fake it disabled={user.pin_disabled}
                  }}
                  disabled
                  variant={user.pin_disabled ? "outline" : "secondary"}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Ban className="w-4 h-4" />
                  <span>{user.pin_disabled ? "Enable PIN" : "Disable PIN"}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default AdminPinManagement;
