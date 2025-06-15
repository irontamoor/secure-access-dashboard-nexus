
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ControllerKey = {
  id: string;
  controller_name: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
};

export default function ControllerApiKeyManager() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ControllerKey[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchKeys = async () => {
    const { data, error } = await supabase
      .from("controller_api_keys")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error fetching keys", description: error.message, variant: "destructive" });
    }
    setKeys(data || []);
  };

  useEffect(() => {
    fetchKeys();
    // eslint-disable-next-line
  }, []);

  const handleCreateKey = async () => {
    if (!newName.trim()) {
      toast({ title: "Controller name required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("gen_random_api_key", { controller_name_in: newName });
    if (error) {
      toast({ title: "API key generation failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "API Key created", description: `Controller: ${newName}` });
      setNewName("");
      fetchKeys();
    }
    setLoading(false);
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm("Are you sure? This will deactivate the API key.")) return;
    setLoading(true);
    const { error } = await supabase
      .from("controller_api_keys")
      .update({ is_active: false })
      .eq("id", id as string);
    if (error) {
      toast({ title: "Failed to revoke key", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "API key revoked" });
      fetchKeys();
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controller API Keys</CardTitle>
        <CardDescription>
          Create unique API keys for each door controller. Revoke keys when controllers are replaced.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col md:flex-row gap-2 items-end">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Controller Name (e.g. Main Entrance)"
            className="w-full md:w-1/2"
            disabled={loading}
          />
          <Button onClick={handleCreateKey} disabled={loading}>
            {loading ? "Generating..." : "Generate API Key"}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Controller</th>
                <th className="p-2">API Key</th>
                <th className="p-2">Active</th>
                <th className="p-2">Created</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">No API keys yet.</td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id} className={k.is_active ? "" : "line-through text-gray-400"}>
                    <td className="p-2">{k.controller_name}</td>
                    <td className="p-2 font-mono select-all">{k.api_key}</td>
                    <td className="p-2">{k.is_active ? "Yes" : "No"}</td>
                    <td className="p-2">{new Date(k.created_at).toLocaleString()}</td>
                    <td className="p-2">
                      {k.is_active && (
                        <Button size="sm" onClick={() => handleRevoke(k.id)} disabled={loading}>
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
