import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit2, DoorOpen, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Door } from "@/types/database";

interface DoorGroup {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  doors: Door[];
}

const DoorGroups = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<DoorGroup[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DoorGroup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [editingGroup, setEditingGroup] = useState<DoorGroup | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDesc, setEditingDesc] = useState("");
  const [editingDoors, setEditingDoors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
    loadDoors();
  }, []);

  const loadDoors = async () => {
    const { data, error } = await supabase.from("doors").select("*").order("name");
    if (!error && data) {
      // Explicitly transform ip_address to string | null
      setDoors((data as any[]).map((d) => ({
        ...d,
        ip_address: typeof d.ip_address === "string" ? d.ip_address : d.ip_address === null ? null : String(d.ip_address),
      })));
    }
  };

  const loadGroups = async () => {
    setLoading(true);
    try {
      const { data: groupRows, error: groupErr } = await supabase.from("door_groups").select("*").order("name");
      if (groupErr) throw groupErr;

      const { data: memberRows, error: memberErr } = await supabase.from("door_group_members").select("*");
      if (memberErr) throw memberErr;

      const { data: doorsRows } = await supabase.from("doors").select("*");

      // FIX: Explicitly cast ip_address to correct type
      const doorsMap: { [id: string]: Door } = {};
      (doorsRows || []).forEach((d: any) => {
        doorsMap[d.id] = {
          ...d,
          ip_address: typeof d.ip_address === 'string' ? d.ip_address : d.ip_address === null ? null : String(d.ip_address),
        };
      });

      const groupList: DoorGroup[] = (groupRows || []).map((group: any) => ({
        ...group,
        doors: memberRows
          .filter((m: any) => m.group_id === group.id)
          .map((m: any) => doorsMap[m.door_id])
          .filter(Boolean),
      }));

      setGroups(groupList);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not load door groups",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const createGroup = async () => {
    if (!newGroup.name.trim()) {
      toast({
        title: "Enter group name!",
        variant: "destructive",
      });
      return;
    }
    const { data, error } = await supabase
      .from("door_groups")
      .insert([{ name: newGroup.name.trim(), description: newGroup.description || null }])
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: "Failed to create group", variant: "destructive" });
      return;
    }
    setNewGroup({ name: "", description: "" });
    setIsDialogOpen(false);
    await loadGroups();
    toast({ title: "Created", description: `Created group "${data.name}"` });
  };

  const deleteGroup = async (groupId: string) => {
    const { error } = await supabase.from("door_groups").delete().eq("id", groupId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      await loadGroups();
      toast({ title: "Deleted", description: "Group removed" });
    }
  };

  const openEdit = (group: DoorGroup) => {
    setEditingGroup(group);
    setEditingName(group.name);
    setEditingDesc(group.description || "");
    setEditingDoors(group.doors.map((d) => d.id));
  };

  const saveEdit = async () => {
    if (!editingGroup) return;
    const { error: gErr } = await supabase
      .from("door_groups")
      .update({ name: editingName, description: editingDesc, updated_at: new Date().toISOString() })
      .eq("id", editingGroup.id);
    if (gErr) {
      toast({ title: "Error", description: "Failed to update group", variant: "destructive" });
      return;
    }
    // Update door members
    // 1. Remove old members
    await supabase.from("door_group_members").delete().eq("group_id", editingGroup.id);
    // 2. Add new members
    for (const doorId of editingDoors) {
      await supabase.from("door_group_members").insert({ group_id: editingGroup.id, door_id: doorId });
    }
    setEditingGroup(null);
    await loadGroups();
    toast({ title: "Saved!", description: "Group updated" });
  };

  if (loading) return <div className="flex justify-center py-8">Loading door groups...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Door Groups</h2>
          <p className="text-gray-600">Create and manage door groups to simplify assigning permissions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Door Group</DialogTitle>
              <DialogDescription>Add a new group of doors (e.g. Labs, Lobby...)</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Group Name</Label>
                <Input value={newGroup.name} onChange={(e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))} autoFocus />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input value={newGroup.description} onChange={(e) => setNewGroup((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={createGroup}>
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="bg-white/60 border-0 shadow-lg">
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex-1 flex items-center gap-2">
                <Folder className="w-5 h-5 text-blue-500" />
                <CardTitle className="flex-grow">{group.name}</CardTitle>
                {group.description && (
                  <CardDescription className="ml-3">{group.description}</CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(group)}>
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:text-red-800" onClick={() => deleteGroup(group.id)}>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-2">
                {group.doors.map((door) => (
                  <Badge key={door.id} variant="secondary" className="flex items-center px-2 py-0.5">
                    <DoorOpen className="w-3 h-3 mr-1 text-blue-700" />
                    {door.name}
                  </Badge>
                ))}
              </div>
              {!group.doors || !group.doors.length ? (
                <div className="text-gray-400 text-sm mb-2">No doors assigned</div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Edit dialog */}
      <Dialog open={!!editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>Change the name/description and doors in this group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Group Name</Label>
              <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={editingDesc} onChange={(e) => setEditingDesc(e.target.value)} />
            </div>
            <div>
              <Label>Doors in Group</Label>
              <div className="flex flex-wrap gap-2 my-2">
                {doors.map((door) => (
                  <button
                    className={`px-2 py-1 rounded border ${editingDoors.includes(door.id) ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-200'}`}
                    key={door.id}
                    type="button"
                    onClick={() =>
                      setEditingDoors((prev) =>
                        prev.includes(door.id)
                          ? prev.filter((id) => id !== door.id)
                          : [...prev, door.id]
                      )
                    }
                  >
                    {door.name}
                  </button>
                ))}
                {!doors.length && <span className="text-gray-400">No doors available</span>}
              </div>
            </div>
            <Button className="w-full" onClick={saveEdit}>
              Save Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoorGroups;
