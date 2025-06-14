import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mail } from "lucide-react";

interface Props {
  settings: Record<string, string>;
  setSettings: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  updateSetting: (key: string, value: string) => Promise<void>;
  testSMTPConnection: () => void;
}

const SmtpSettingsCard = ({ settings, setSettings, updateSetting, testSMTPConnection }: Props) => (
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
            value={settings.smtp_host || ""}
            onChange={e => setSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
            placeholder="smtp.gmail.com"
          />
        </div>
        <div>
          <Label htmlFor="smtp_port">SMTP Port</Label>
          <Input
            id="smtp_port"
            value={settings.smtp_port || ""}
            onChange={e => setSettings(prev => ({ ...prev, smtp_port: e.target.value }))}
            placeholder="587"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="smtp_username">Username</Label>
          <Input
            id="smtp_username"
            value={settings.smtp_username || ""}
            onChange={e => setSettings(prev => ({ ...prev, smtp_username: e.target.value }))}
            placeholder="your-email@domain.com"
          />
        </div>
        <div>
          <Label htmlFor="smtp_password">Password</Label>
          <Input
            id="smtp_password"
            type="password"
            value={settings.smtp_password || ""}
            onChange={e => setSettings(prev => ({ ...prev, smtp_password: e.target.value }))}
            placeholder="App password"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="smtp_from_email">From Email</Label>
          <Input
            id="smtp_from_email"
            value={settings.smtp_from_email || ""}
            onChange={e => setSettings(prev => ({ ...prev, smtp_from_email: e.target.value }))}
            placeholder="noreply@yourcompany.com"
          />
        </div>
        <div>
          <Label htmlFor="smtp_from_name">From Name</Label>
          <Input
            id="smtp_from_name"
            value={settings.smtp_from_name || ""}
            onChange={e => setSettings(prev => ({ ...prev, smtp_from_name: e.target.value }))}
            placeholder="Door Access System"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email_cc_address">CC All Emails To</Label>
          <Input
            id="email_cc_address"
            type="email"
            value={settings.email_cc_address || ""}
            onChange={e => setSettings(prev => ({ ...prev, email_cc_address: e.target.value }))}
            placeholder="it-admin@yourcompany.com"
            autoComplete="off"
          />
        </div>
        <div>
          {/* Intentionally left blank for layout parity */}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="smtp_use_tls"
          checked={settings.smtp_use_tls === "true"}
          onCheckedChange={checked => setSettings(prev => ({ ...prev, smtp_use_tls: checked.toString() }))}
        />
        <Label htmlFor="smtp_use_tls">Use TLS Encryption</Label>
      </div>
      <div className="flex space-x-2">
        <Button onClick={() => {
          Object.keys(settings).forEach(key => {
            if (key.startsWith("smtp_") || key === "email_cc_address") updateSetting(key, settings[key]);
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
);
export default SmtpSettingsCard;
