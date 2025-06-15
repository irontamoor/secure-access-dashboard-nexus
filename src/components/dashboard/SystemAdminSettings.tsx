
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LdapConfigForm from "./database-settings/LdapConfigForm";
import SyncHistoryCard from "./database-settings/SyncHistoryCard";
import ControllerApiKeyManager from "./ControllerApiKeyManager";
import CardSwipeHistory from "./CardSwipeHistory";

const API_BASE = "http://localhost:4000/api";
const ERROR_LEVELS = [
  { label: "All", value: "all" },
  { label: "Warning & Critical", value: "warning_critical" },
  { label: "Critical Only", value: "critical" },
];

export default function SystemAdminSettings() {
  const { toast } = useToast();
  // System (old SystemSettings)
  const [adminEmail, setAdminEmail] = useState("");
  const [errorLevel, setErrorLevel] = useState("all");
  // Database (from DatabaseSettings)
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchSystemSettings();
    loadSettings();
    loadSyncLogs();
  }, []);

  // --- REST call replacements for Supabase ---
  const fetchSystemSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/system_settings`);
      const data = await res.json();
      const d = Object.fromEntries((data || []).map((s: any) => [s.setting_key, s.setting_value]));
      setAdminEmail(d.admin_email ?? "");
      setErrorLevel(d.error_alerts_level ?? "all");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin/email settings",
        variant: "destructive",
      });
    }
  };

  const handleAdminEmailSave = async () => {
    await fetch(`${API_BASE}/system_settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setting_key: "admin_email",
        setting_value: adminEmail,
        setting_type: "string",
      })
    });
    toast({ title: "Admin email updated", description: adminEmail });
  };

  const handleAlertLevelSave = async () => {
    await fetch(`${API_BASE}/system_settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setting_key: "error_alerts_level",
        setting_value: errorLevel,
        setting_type: "string",
      })
    });
    toast({ title: "Error alert level updated", description: errorLevel });
  };

  // Loads ldap_ settings
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/system_settings?prefix=ldap_`);
      const data = await res.json();
      const settingsMap = (data || []).reduce((acc: any, setting: any) => {
        acc[setting.setting_key] = setting.setting_value || "";
        return acc;
      }, {});
      setSettings(settingsMap);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load LDAP/database settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSyncLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/ldap_sync_logs`);
      const data = await res.json();
      setSyncLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load LDAP sync logs",
        variant: "destructive",
      });
    }
  };

  // --- Setting update endpoint using REST ---
  const updateSetting = async (key: string, value: string) => {
    try {
      await fetch(`${API_BASE}/system_settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setting_key: key,
          setting_value: value,
          setting_type: "string"
        })
      });
      setSettings((prev) => ({ ...prev, [key]: value }));
      toast({
        title: "Setting Updated",
        description: `${key} has been updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  // fake/test LDAP handlers (no server triggers in legacy code)
  const testLdapConnection = async () => {
    toast({
      title: "LDAP Test",
      description: "Testing LDAP connection... (This would test the LDAP configuration)",
    });
  };
  const triggerLdapSync = async () => {
    setIsSyncing(true);
    toast({ title: "LDAP Sync Started", description: "Starting LDAP synchronization..." });
    setTimeout(() => {
      setIsSyncing(false);
      loadSyncLogs();
      toast({
        title: "LDAP Sync Complete",
        description: "User synchronization completed successfully",
      });
    }, 3000);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading system settings...</div>;
  }

  return (
    <div className="space-y-10 w-full max-w-3xl mx-auto animate-fade-in">
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">System Administration Settings</h2>
        <p className="text-gray-600">
          Configure LDAP/database integration, email, and error alert settings
        </p>
      </section>

      {/* LDAP Database Integration */}
      <div className="bg-white/60 backdrop-blur-sm shadow-lg rounded-lg p-6 space-y-2">
        <h3 className="text-xl font-semibold text-indigo-900 mb-1">LDAP Database Integration</h3>
        <p className="mb-5 text-gray-500">Configure LDAP and view sync history.</p>
        <LdapConfigForm
          settings={settings}
          setSettings={setSettings}
          updateSetting={updateSetting}
          testLdapConnection={testLdapConnection}
          triggerLdapSync={triggerLdapSync}
          isSyncing={isSyncing}
        />
      </div>

      {/* LDAP Sync History */}
      <div className="bg-white/60 backdrop-blur-sm shadow-lg rounded-lg p-6 space-y-2">
        <h3 className="text-xl font-semibold text-indigo-900 mb-2">LDAP Sync History</h3>
        <SyncHistoryCard syncLogs={syncLogs} />
      </div>

      {/* System Administrator Email */}
      <div className="bg-white/60 backdrop-blur-sm shadow-lg rounded-lg p-6 space-y-2">
        <h3 className="text-xl font-semibold text-indigo-900 mb-2">System Administrator Email</h3>
        <p className="text-gray-500 mb-2">
          This address will receive error notifications from the system.
        </p>
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1">
            <Label htmlFor="admin_email">Admin Email</Label>
            <Input
              id="admin_email"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleAdminEmailSave}>Save</Button>
        </div>
      </div>

      {/* Error Alert Level */}
      <div className="bg-white/60 backdrop-blur-sm shadow-lg rounded-lg p-6 space-y-2">
        <h3 className="text-xl font-semibold text-indigo-900 mb-2">Error Alert Level</h3>
        <p className="text-gray-500 mb-2">
          Choose the error severity for which email alerts will be sent to the system administrator.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            className="border rounded px-3 py-2"
            value={errorLevel}
            onChange={(e) => setErrorLevel(e.target.value)}
          >
            {ERROR_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <Button onClick={handleAlertLevelSave}>Save</Button>
        </div>
      </div>

      {/* Controller API Keys Management */}
      <ControllerApiKeyManager />

      {/* Card Swipe History Lookup */}
      <CardSwipeHistory />
    </div>
  );
}
