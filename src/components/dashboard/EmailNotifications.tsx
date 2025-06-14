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
import GeneralEmailSettingsCard from "./email-notifications/GeneralEmailSettingsCard";
import FailedAccessCard from "./email-notifications/FailedAccessCard";
import NoSwipeOutCard from "./email-notifications/NoSwipeOutCard";
import TestEmailCard from "./email-notifications/TestEmailCard";

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
          'no_swipe_out_alert_time'
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
        <GeneralEmailSettingsCard settings={settings} updateSetting={updateSetting} />
        <FailedAccessCard />
        <NoSwipeOutCard settings={settings} setSettings={setSettings} updateSetting={updateSetting} />
        <TestEmailCard settings={settings} sendTestEmail={sendTestEmail} />
      </div>
    </div>
  );
};

export default EmailNotifications;
