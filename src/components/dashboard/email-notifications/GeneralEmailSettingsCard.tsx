
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

interface Props {
  settings: Record<string, string>;
  updateSetting: (key: string, value: string) => void;
}

const GeneralEmailSettingsCard = ({ settings, updateSetting }: Props) => (
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
);

export default GeneralEmailSettingsCard;
