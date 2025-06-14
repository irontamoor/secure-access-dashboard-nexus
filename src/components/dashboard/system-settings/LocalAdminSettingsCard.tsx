
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";

interface Props {
  settings: Record<string, string>;
  setSettings: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  updateSetting: (key: string, value: string) => Promise<void>;
}

const LocalAdminSettingsCard = ({ settings, setSettings, updateSetting }: Props) => (
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
          checked={settings.local_admin_enabled === "true"}
          onCheckedChange={checked => setSettings(prev => ({ ...prev, local_admin_enabled: checked.toString() }))}
        />
        <Label htmlFor="local_admin_enabled">Enable Local Admin Access</Label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="local_admin_username">Local Admin Username</Label>
          <Input
            id="local_admin_username"
            value={settings.local_admin_username || ""}
            onChange={e => setSettings(prev => ({ ...prev, local_admin_username: e.target.value }))}
            placeholder="localadmin"
          />
        </div>
        <div>
          <Label htmlFor="local_admin_password">Local Admin Password</Label>
          <Input
            id="local_admin_password"
            type="password"
            value={settings.local_admin_password || ""}
            onChange={e => setSettings(prev => ({ ...prev, local_admin_password: e.target.value }))}
            placeholder="admin123"
          />
        </div>
      </div>
      <Button onClick={() => {
        ["local_admin_enabled", "local_admin_username", "local_admin_password"].forEach(key => {
          updateSetting(key, settings[key]);
        });
      }}>
        Save Local Admin Settings
      </Button>
    </CardContent>
  </Card>
);

export default LocalAdminSettingsCard;
