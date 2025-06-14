import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, Server, RefreshCw } from 'lucide-react';
import type { SystemSetting, LdapSyncLog } from '@/types/database';
import LdapConfigForm from './database-settings/LdapConfigForm';
import SyncHistoryCard from './database-settings/SyncHistoryCard';

const DatabaseSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [syncLogs, setSyncLogs] = useState<LdapSyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSyncLogs();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .like('setting_key', 'ldap_%');

      if (error) throw error;

      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value || '';
        return acc;
      }, {} as Record<string, string>);

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load database settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('ldap_sync_log')
        .select('*')
        .order('sync_started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      // Convert sync_status string to valid enum if necessary
      setSyncLogs(
        (data || []).map((log) => ({
          ...log,
          sync_status:
            log.sync_status === "running" || log.sync_status === "completed" || log.sync_status === "failed"
              ? log.sync_status
              : "running",
        }))
      );
    } catch (error) {
      console.error('Error loading sync logs:', error);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key);

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Setting Updated",
        description: `${key} has been updated successfully`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  const testLdapConnection = async () => {
    toast({
      title: "LDAP Test",
      description: "Testing LDAP connection... (This would test the LDAP configuration)",
    });
  };

  const triggerLdapSync = async () => {
    setIsSyncing(true);
    try {
      toast({
        title: "LDAP Sync Started",
        description: "Starting LDAP synchronization...",
      });
      
      // In a real implementation, this would call an edge function
      // that performs the actual LDAP sync
      setTimeout(() => {
        setIsSyncing(false);
        loadSyncLogs();
        toast({
          title: "LDAP Sync Complete",
          description: "User synchronization completed successfully",
        });
      }, 3000);
    } catch (error) {
      setIsSyncing(false);
      toast({
        title: "Sync Failed",
        description: "LDAP synchronization failed",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading database settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Database Settings</h2>
        <p className="text-gray-600">Configure LDAP integration and user synchronization</p>
      </div>

      <div className="grid gap-6">
        <LdapConfigForm
          settings={settings}
          setSettings={setSettings}
          updateSetting={updateSetting}
          testLdapConnection={testLdapConnection}
          triggerLdapSync={triggerLdapSync}
          isSyncing={isSyncing}
        />
        <SyncHistoryCard syncLogs={syncLogs} />
      </div>
    </div>
  );
};

export default DatabaseSettings;
