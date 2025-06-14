
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Trash2, User, DoorOpen } from 'lucide-react';
import type { DoorPermission, User as DBUser, Door as DBDoor } from '@/types/database';
import type { DoorGroup } from '../DoorPermissions';

interface PermissionCardProps {
  permission: DoorPermission;
  user: DBUser | undefined;
  door: DBDoor | undefined;
  group: DoorGroup | undefined;
  onRevoke: (permissionId: string) => void;
}

export default function PermissionCard({
  permission,
  user,
  door,
  group,
  onRevoke,
}: PermissionCardProps) {
  const targetLabel =
    permission.door_group_id
      ? group ? `Group: ${group.name}` : "Group (unknown)"
      : permission.door_id
        ? door ? `Door: ${door.name}` : "Door (unknown)"
        : 'Unknown';

  const targetInfo =
    permission.door_group_id
      ? group?.name || "Unknown group"
      : permission.door_id
        ? door ? `${door.name} - ${door.location}` : "Unknown"
        : "Unknown";

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">{user ? user.name : "Unknown"}</span>
                <span className="text-gray-500">@{user ? user.username : ""}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <DoorOpen className="w-4 h-4 text-gray-500" />
                <span>{targetInfo}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{targetLabel}</Badge>
              </div>
              {permission.notes && (
                <p className="text-sm text-gray-600 mt-1">{permission.notes}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right text-sm text-gray-500">
              <p>Granted: {new Date(permission.granted_at).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => onRevoke(permission.id)}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 border border-red-300 rounded px-2 py-1 text-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Revoke</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
