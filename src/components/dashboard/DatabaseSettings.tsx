
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, Server, Sync, RefreshCw } from 'lucide-react';
import type { SystemSetting, LdapSyncLog } from '@/types/database';

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
      setSyncLogs(data || []);
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
        {/* LDAP Configuration */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="w-5 h-5" />
              <span>LDAP Configuration</span>
            </CardTitle>
            <CardDescription>
              Configure LDAP authentication and user synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="ldap_enabled"
                checked={settings.ldap_enabled === 'true'}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, ldap_enabled: checked.toString() }))}
              />
              <Label htmlFor="ldap_enabled">Enable LDAP Authentication</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ldap_server_url">LDAP Server URL</Label>
                <Input
                  id="ldap_server_url"
                  value={settings.ldap_server_url || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, ldap_server_url: e.target.value }))}
                  placeholder="ldap://domain.com:389"
                />
              </div>
              <div>
                <Label htmlFor="ldap_sync_interval">Sync Interval (seconds)</Label>
                <Input
                  id="ldap_sync_interval"
                  type="number"
                  value={settings.ldap_sync_interval || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, ldap_sync_interval: e.target.value }))}
                  placeholder="3600"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="ldap_bind_dn">Bind DN</Label>
              <Input
                id="ldap_bind_dn"
                value={settings.ldap_bind_dn || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, ldap_bind_dn: e.target.value }))}
                placeholder="CN=admin,DC=domain,DC=com"
              />
            </div>

            <div>
              <Label htmlFor="ldap_bind_password">Bind Password</Label>
              <Input
                id="ldap_bind_password"
                type="password"
                value={settings.ldap_bind_password || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, ldap_bind_password: e.target.value }))}
                placeholder="Bind password"
              />
            </div>

            <div>
              <Label htmlFor="ldap_user_search_base">User Search Base</Label>
              <Input
                id="ldap_user_search_base"
                value={settings.ldap_user_search_base || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, ldap_user_search_base: e.target.value }))}
                placeholder="OU=Users,DC=domain,DC=com"
              />
            </div>

            <div>
              <Label htmlFor="ldap_user_search_filter">User Search Filter</Label>
              <Textarea
                id="ldap_user_search_filter"
                value={settings.ldap_user_search_filter || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, ldap_user_search_filter: e.target.value }))}
                placeholder="(&(objectClass=user)(memberOf=CN=door_access,OU=Groups,DC=domain,DC=com))"
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => {
                Object.keys(settings).forEach(key => {
                  if (key.startsWith('ldap_')) {
                    updateSetting(key, settings[key]);
                  }
                });
              }}>
                Save LDAP Settings
              </Button>
              <Button onClick={testLdapConnection} variant="outline">
                Test Connection
              </Button>
              <Button 
                onClick={triggerLdapSync} 
                variant="outline"
                disabled={isSyncing}
                className="flex items-center space-x-2"
              >
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sync className="w-4 h-4" />
                )}
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sync History */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Sync History</span>
            </CardTitle>
            <CardDescription>
              Recent LDAP synchronization logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {new Date(log.sync_started_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {log.sync_status} | Users: {log.users_synced || 0} | Errors: {log.errors_count || 0}
                    </p>
                    {log.error_details && (
                      <p className="text-sm text-red-600">{log.error_details}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    log.sync_status === 'completed' ? 'bg-green-100 text-green-800' :
                    log.sync_status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.sync_status}
                  </div>
                </div>
              ))}
              {syncLogs.length === 0 && (
                <p className="text-gray-500 text-center py-4">No sync logs available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseSettings;
