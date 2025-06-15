
import { useState } from 'react';
import type { User as UserType } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

const API_BASE = "http://localhost:4000/api";

export function useUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      const transformed: UserType[] = (data || []).map((user: any) => ({
        ...user,
        role: user.role as 'admin' | 'staff',
        disabled: !!user.disabled,
        pin_disabled: !!user.pin_disabled,
        card_number: user.card_number || null,
      }));
      setUsers(transformed);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (newUser: {
    username: string;
    email: string;
    name: string;
    role: 'admin' | 'staff';
    pin: string;
    card_number?: string;
  }) => {
    if (users.some(u => !u.disabled && u.card_number === newUser.card_number)) {
      toast({
        title: "Error",
        description: "This card number is already assigned to another enabled user.",
        variant: "destructive",
      });
      return false;
    }

    if (
      !newUser.username ||
      !newUser.email ||
      !newUser.name ||
      !newUser.pin ||
      !newUser.card_number
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields, including card number.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error("Failed to create user");
      const data = await res.json();
      const transformed: UserType = {
        ...data,
        role: data.role as 'admin' | 'staff',
      };
      setUsers((prev) => [...prev, transformed]);
      toast({
        title: "User Created",
        description: `User ${data.name} has been created successfully`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateUserCardNumber = async (user: UserType, card_number: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_number }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, card_number } : u)));
      toast({
        title: "Card Number Updated",
        description: `Card number updated for ${user.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update card number",
        variant: "destructive",
      });
    }
  };

  const resetUserPin = async (user: UserType) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: newPin }),
      });
      if (!res.ok) throw new Error("Failed to reset PIN");
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, pin: newPin } : u)));
      toast({
        title: "PIN Reset",
        description: `A new PIN has been set for ${user.name}. The PIN is not shown for security reasons.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset PIN",
        variant: "destructive",
      });
    }
  };

  const toggleUserDisabled = async (user: UserType) => {
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/disable`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: !user.disabled }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, disabled: !user.disabled } : u
        )
      );
      toast({
        title: !user.disabled ? "User Disabled" : "User Restored",
        description: !user.disabled
          ? `${user.name} is now disabled`
          : `${user.name} is now active`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const togglePinDisabled = async (user: UserType) => {
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/pin_disabled`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin_disabled: !user.pin_disabled }),
      });
      if (!res.ok) throw new Error("Failed to update PIN status");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, pin_disabled: !user.pin_disabled } : u
        )
      );
      toast({
        title: !user.pin_disabled ? "PIN Disabled" : "PIN Enabled",
        description: !user.pin_disabled
          ? `PIN for ${user.name} is disabled`
          : `PIN for ${user.name} is enabled`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update PIN status",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (user: UserType) => {
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast({
        title: "User Deleted",
        description: `${user.name} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return {
    users,
    loading,
    loadUsers,
    createUser,
    updateUserCardNumber,
    resetUserPin,
    toggleUserDisabled,
    togglePinDisabled,
    deleteUser,
  };
}
