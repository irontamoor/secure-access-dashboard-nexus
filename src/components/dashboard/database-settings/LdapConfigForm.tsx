
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Server } from "lucide-react";

interface Props {
  settings: Record<string, string>;
  setSettings: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  updateSetting: (key: string, value: string) => Promise<void>;
  testLdapConnection: () => void;
  triggerLdapSync: () => void;
  isSyncing: boolean;
}

const LdapConfigForm = ({
  settings,
  setSettings,
  updateSetting,
  testLdapConnection,
  triggerLdapSync,
  isSyncing
}: Props) => (
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
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default LdapConfigForm;
