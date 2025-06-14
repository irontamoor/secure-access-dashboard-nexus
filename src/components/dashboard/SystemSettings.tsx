
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Database, Shield } from 'lucide-react';
import type { SystemSetting } from '@/types/database';

const SystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

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
        description: "Failed to load system settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const testSMTPConnection = async () => {
    toast({
      title: "SMTP Test",
      description: "Testing SMTP connection... (This would send a test email)",
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600">Configure SMTP, security, and system preferences</p>
      </div>

      <div className="grid gap-6">
        {/* SMTP Settings */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>SMTP Configuration</span>
            </CardTitle>
            <CardDescription>
              Configure email settings for sending PIN notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp_host">SMTP Host</Label>
                <Input
                  id="smtp_host"
                  value={settings.smtp_host || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_port">SMTP Port</Label>
                <Input
                  id="smtp_port"
                  value={settings.smtp_port || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_port: e.target.value }))}
                  placeholder="587"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp_username">Username</Label>
                <Input
                  id="smtp_username"
                  value={settings.smtp_username || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_username: e.target.value }))}
                  placeholder="your-email@domain.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_password">Password</Label>
                <Input
                  id="smtp_password"
                  type="password"
                  value={settings.smtp_password || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_password: e.target.value }))}
                  placeholder="App password"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp_from_email">From Email</Label>
                <Input
                  id="smtp_from_email"
                  value={settings.smtp_from_email || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_from_email: e.target.value }))}
                  placeholder="noreply@yourcompany.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_from_name">From Name</Label>
                <Input
                  id="smtp_from_name"
                  value={settings.smtp_from_name || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_from_name: e.target.value }))}
                  placeholder="Door Access System"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="smtp_use_tls"
                checked={settings.smtp_use_tls === 'true'}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smtp_use_tls: checked.toString() }))}
              />
              <Label htmlFor="smtp_use_tls">Use TLS Encryption</Label>
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => {
                Object.keys(settings).forEach(key => {
                  if (key.startsWith('smtp_')) {
                    updateSetting(key, settings[key]);
                  }
                });
              }}>
                Save SMTP Settings
              </Button>
              <Button onClick={testSMTPConnection} variant="outline">
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Local Admin Settings */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Local Admin Access</span>
            </CardTitle>
            <CardDescription>
              Emergency access when database is unavailable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="local_admin_enabled"
                checked={settings.local_admin_enabled === 'true'}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, local_admin_enabled: checked.toString() }))}
              />
              <Label htmlFor="local_admin_enabled">Enable Local Admin Access</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="local_admin_username">Local Admin Username</Label>
                <Input
                  id="local_admin_username"
                  value={settings.local_admin_username || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, local_admin_username: e.target.value }))}
                  placeholder="localadmin"
                />
              </div>
              <div>
                <Label htmlFor="local_admin_password">Local Admin Password</Label>
                <Input
                  id="local_admin_password"
                  type="password"
                  value={settings.local_admin_password || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, local_admin_password: e.target.value }))}
                  placeholder="admin123"
                />
              </div>
            </div>

            <Button onClick={() => {
              ['local_admin_enabled', 'local_admin_username', 'local_admin_password'].forEach(key => {
                updateSetting(key, settings[key]);
              });
            }}>
              Save Local Admin Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettings;
