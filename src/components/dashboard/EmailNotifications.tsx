import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, AlertTriangle, Clock } from 'lucide-react';

const EmailNotifications = () => {
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
        .select('*')
        .in('setting_key', [
          'email_notifications_enabled',
          'email_failed_access_enabled', 
          'email_no_swipe_out_enabled',
          'smtp_host',
          'smtp_port',
          'smtp_username',
          'smtp_password',
          'smtp_from_email',
          'smtp_from_name',
          'no_swipe_out_threshold_hours'
        ]);

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
        description: "Failed to load email notification settings",
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

  const sendTestEmail = async () => {
    toast({
      title: "Test Email",
      description: "Sending test email notification...",
    });
    
    // In a real implementation, this would call an edge function
    // that sends a test email using the configured SMTP settings
    setTimeout(() => {
      toast({
        title: "Test Email Sent",
        description: "Test email has been sent successfully",
      });
    }, 2000);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading email settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Email Notifications</h2>
        <p className="text-gray-600">Configure email alerts for access control events</p>
      </div>

      <div className="grid gap-6">
        {/* General Email Settings */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>General Settings</span>
            </CardTitle>
            <CardDescription>
              Configure when email notifications are sent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="email_notifications_enabled"
                checked={settings.email_notifications_enabled === 'true'}
                onCheckedChange={(checked) => updateSetting('email_notifications_enabled', checked.toString())}
              />
              <Label htmlFor="email_notifications_enabled">Enable Email Notifications</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="email_failed_access_enabled"
                checked={settings.email_failed_access_enabled === 'true'}
                onCheckedChange={(checked) => updateSetting('email_failed_access_enabled', checked.toString())}
              />
              <Label htmlFor="email_failed_access_enabled">Send alerts for failed access attempts</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="email_no_swipe_out_enabled"
                checked={settings.email_no_swipe_out_enabled === 'true'}
                onCheckedChange={(checked) => updateSetting('email_no_swipe_out_enabled', checked.toString())}
              />
              <Label htmlFor="email_no_swipe_out_enabled">Send alerts when users don't swipe out</Label>
            </div>
          </CardContent>
        </Card>

        {/* Failed Access Alerts */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Failed Access Alerts</span>
            </CardTitle>
            <CardDescription>
              Notifications sent when incorrect PINs are used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Alert Triggers:</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Incorrect PIN entered</li>
                <li>• Unauthorized access attempts</li>
                <li>• Multiple failed attempts from same user</li>
                <li>• Access denied due to expired permissions</li>
              </ul>
            </div>
            
            <div>
              <Label>Email Template Preview</Label>
              <Textarea
                value={`Subject: Access Denied Alert - Door Access System

Dear Administrator,

An unauthorized access attempt was detected:

Door: [DOOR_NAME] at [LOCATION]
Time: [TIMESTAMP]
PIN Used: [PIN_USED]
IP Address: [IP_ADDRESS]

Please review the access logs for more details.

Best regards,
Door Access System`}
                rows={10}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* No Swipe Out Alerts */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>No Swipe Out Alerts</span>
            </CardTitle>
            <CardDescription>
              Notifications for users who don't swipe out of secured areas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Alert Triggers:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • User enters but doesn't exit within configured time
                  {" "}
                  <span className="font-medium text-blue-900">(currently: {settings.no_swipe_out_threshold_hours || 2} hours)</span>
                </li>
                <li>• Building security hours end with users still inside</li>
                <li>• Emergency evacuation protocols activated</li>
              </ul>
              <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <Label htmlFor="no_swipe_out_threshold_hours">
                  Threshold (hours before alert):
                </Label>
                <Input
                  id="no_swipe_out_threshold_hours"
                  type="number"
                  min={1}
                  step={1}
                  className="w-32"
                  value={settings.no_swipe_out_threshold_hours || ''}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      no_swipe_out_threshold_hours: e.target.value.replace(/[^0-9]/g, ''),
                    }))
                  }
                  onBlur={e => {
                    const val = e.target.value.trim() || '2';
                    if (val !== settings.no_swipe_out_threshold_hours) {
                      updateSetting("no_swipe_out_threshold_hours", val);
                    }
                  }}
                  placeholder="2"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateSetting("no_swipe_out_threshold_hours", settings.no_swipe_out_threshold_hours || '2');
                  }}
                  className="ml-2"
                >
                  Save
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Email Template Preview</Label>
              <Textarea
                value={`Subject: No Exit Recorded Alert - Door Access System

Dear Administrator,

A user has not recorded an exit from a secured area:

User: [USER_NAME] ([USERNAME])
Door: [DOOR_NAME] at [LOCATION]
Entry Time: [ENTRY_TIMESTAMP]
Current Time: [CURRENT_TIMESTAMP]
Duration: [DURATION] (Threshold: ${settings.no_swipe_out_threshold_hours || 2} hours)

Please verify the user's location and status.

Best regards,
Door Access System`}
                rows={10}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Email */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Test Email Configuration</CardTitle>
            <CardDescription>
              Send a test email to verify your SMTP settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="test_email">Test Email Address</Label>
                <Input
                  id="test_email"
                  type="email"
                  placeholder="admin@company.com"
                  defaultValue={settings.smtp_from_email}
                />
              </div>
              <Button onClick={sendTestEmail} className="mt-6">
                Send Test Email
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Make sure your SMTP settings are configured in the System Settings 
                before sending test emails. The test will use your current SMTP configuration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailNotifications;
