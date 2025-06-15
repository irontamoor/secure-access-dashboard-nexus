
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type ControllerApiKey = {
  id: string;
  controller_name: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
};

const API_BASE = "http://localhost:4000/api";

export default function ControllerApiKeyManager() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ControllerApiKey[]>([]);
  const [newName, setNewName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/keys`);
      const data = await res.json();
      if (Array.isArray(data)) setKeys(data);
      else setKeys([]);
    } catch (error: any) {
      toast({ title: "Error fetching keys", description: error.message ?? String(error), variant: "destructive" });
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async () => {
    if (!newName.trim()) {
      toast({ title: "Controller name required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ controller_name: newName })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create API key");
      }
      const newKey = await res.json();
      toast({ title: "API Key created", description: `Controller: ${newName}` });
      setNewName("");
      fetchKeys();
    } catch (error: any) {
      toast({ title: "API key generation failed", description: error.message ?? String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm("Are you sure? This will deactivate the API key.")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/keys/${id}/revoke`, { method: "PATCH" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to revoke key");
      }
      toast({ title: "API key revoked" });
      fetchKeys();
    } catch (error: any) {
      toast({ title: "Failed to revoke key", description: error.message ?? String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
