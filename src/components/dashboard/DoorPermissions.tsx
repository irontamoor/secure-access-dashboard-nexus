
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, User, DoorOpen } from "lucide-react";
import type { User as DBUser, Door as DBDoor, DoorPermission } from '@/types/database';
import PermissionCard from './door-permissions/PermissionCard';
import EmptyPermissionsPlaceholder from './door-permissions/EmptyPermissionsPlaceholder';

export type DoorGroup = {
  id: string;
  name: string;
  description?: string | null;
};

const API_BASE = "http://localhost:4000/api";

const DoorPermissions = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<DBUser[]>([]);
  const [doors, setDoors] = useState<DBDoor[]>([]);
  const [permissions, setPermissions] = useState<DoorPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doorGroups, setDoorGroups] = useState<DoorGroup[]>([]);

  // Load all data via REST API
  useEffect(() => {
    loadData();
    loadDoorGroups();
  }, []);

  const loadDoorGroups = async () => {
    try {
      const res = await fetch(`${API_BASE}/door_groups`);
      const data = await res.json();
      setDoorGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load door groups",
        variant: "destructive",
      });
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, doorsRes, permsRes] = await Promise.all([
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/doors`),
        fetch(`${API_BASE}/door_permissions`),
      ]);
      const usersData = await usersRes.json();
      const doorsData = await doorsRes.json();
      const permsData = await permsRes.json();

      setUsers(Array.isArray(usersData) ? usersData : []);
      setDoors(Array.isArray(doorsData) ? doorsData : []);
      setPermissions(Array.isArray(permsData) ? permsData : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load door permissions data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const revokePermission = async (permissionId: string) => {
    try {
      const res = await fetch(`${API_BASE}/door_permissions/${permissionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke permission");
      setPermissions(prev => prev.filter(p => p.id !== permissionId));
      toast({
        title: "Permission Revoked",
        description: "Door access permission has been revoked",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke permission",
        variant: "destructive",
      });
    }
  };

  const getUserById = (uid: string) => users.find(u => u.id === uid);
  const getDoorById = (did: string) => doors.find(d => d.id === did);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading door permissions...</div>;
  }

  const getGroupById = (gid: string | null) =>
    doorGroups.find(g => g.id === gid);

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {permissions.map((permission) => (
          <PermissionCard
            key={permission.id}
            permission={permission}
            user={getUserById(permission.user_id)}
            door={permission.door_id ? getDoorById(permission.door_id) : undefined}
            group={permission.door_group_id ? getGroupById(permission.door_group_id) : undefined}
            onRevoke={revokePermission}
          />
        ))}
        {permissions.length === 0 && (
          <EmptyPermissionsPlaceholder />
        )}
      </div>
    </div>
  );
};

export default DoorPermissions;
