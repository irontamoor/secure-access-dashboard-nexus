import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const ERROR_LEVELS = [
  { label: 'All', value: 'all' },
  { label: 'Warning & Critical', value: 'warning_critical' },
  { label: 'Critical Only', value: 'critical' },
];

export default function SystemSettings() {
  const [ldapSyncEnabled, setLdapSyncEnabled] = useState(false);
  const [ldapServer, setLdapServer] = useState('');
  const [ldapBaseDn, setLdapBaseDn] = useState('');
  const [ldapBindDn, setLdapBindDn] = useState('');
  const [ldapBindPassword, setLdapBindPassword] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpFromEmail, setSmtpFromEmail] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [errorLevel, setErrorLevel] = useState('all');

  useEffect(() => {
    supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'ldap_sync_enabled',
        'ldap_server',
        'ldap_base_dn',
        'ldap_bind_dn',
        'ldap_bind_password',
        'smtp_host',
        'smtp_port',
        'smtp_username',
        'smtp_password',
        'smtp_from_email',
        'smtp_from_name',
        'admin_email',
        'error_alerts_level'
      ])
      .then(({ data }) => {
        if (data) {
          const settings = Object.fromEntries(data.map(s => [s.setting_key, s.setting_value]));
          setLdapSyncEnabled(settings.ldap_sync_enabled === 'true');
          setLdapServer(settings.ldap_server ?? '');
          setLdapBaseDn(settings.ldap_base_dn ?? '');
          setLdapBindDn(settings.ldap_bind_dn ?? '');
          setLdapBindPassword(settings.ldap_bind_password ?? '');
          setSmtpHost(settings.smtp_host ?? '');
          setSmtpPort(settings.smtp_port ?? '');
          setSmtpUsername(settings.smtp_username ?? '');
          setSmtpPassword(settings.smtp_password ?? '');
          setSmtpFromEmail(settings.smtp_from_email ?? '');
          setSmtpFromName(settings.smtp_from_name ?? '');
          setAdminEmail(settings.admin_email ?? '');
          setErrorLevel(settings.error_alerts_level ?? 'all');
        }
      });
  }, []);

  const updateSetting = async (key: string, value: string) => {
    await supabase
      .from('system_settings')
      .upsert({ setting_key: key, setting_value: value, setting_type: 'string' });
  };

  const handleAdminEmailSave = () => {
    supabase
      .from('system_settings')
      .upsert({ setting_key: 'admin_email', setting_value: adminEmail, setting_type: 'string' });
  };
  const handleAlertLevelSave = () => {
    supabase
      .from('system_settings')
      .upsert({ setting_key: 'error_alerts_level', setting_value: errorLevel, setting_type: 'string' });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>LDAP Synchronization</CardTitle>
          <CardDescription>Configure LDAP synchronization settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="ldap_sync_enabled">Enable LDAP Sync</Label>
            <Input
              id="ldap_sync_enabled"
              type="checkbox"
              checked={ldapSyncEnabled}
              onChange={e => {
                setLdapSyncEnabled(e.target.checked);
                updateSetting('ldap_sync_enabled', e.target.checked.toString());
              }}
            />
          </div>
          <div>
            <Label htmlFor="ldap_server">LDAP Server</Label>
            <Input
              id="ldap_server"
              type="text"
              value={ldapServer}
              onChange={e => {
                setLdapServer(e.target.value);
                updateSetting('ldap_server', e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="ldap_base_dn">LDAP Base DN</Label>
            <Input
              id="ldap_base_dn"
              type="text"
              value={ldapBaseDn}
              onChange={e => {
                setLdapBaseDn(e.target.value);
                updateSetting('ldap_base_dn', e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="ldap_bind_dn">LDAP Bind DN</Label>
            <Input
              id="ldap_bind_dn"
              type="text"
              value={ldapBindDn}
              onChange={e => {
                setLdapBindDn(e.target.value);
                updateSetting('ldap_bind_dn', e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="ldap_bind_password">LDAP Bind Password</Label>
            <Input
              id="ldap_bind_password"
              type="password"
              value={ldapBindPassword}
              onChange={e => {
                setLdapBindPassword(e.target.value);
                updateSetting('ldap_bind_password', e.target.value);
              }}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>SMTP Settings</CardTitle>
          <CardDescription>Configure SMTP settings for sending emails.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="smtp_host">SMTP Host</Label>
            <Input
              id="smtp_host"
              type="text"
              value={smtpHost}
              onChange={e => {
                setSmtpHost(e.target.value);
                updateSetting('smtp_host', e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="smtp_port">SMTP Port</Label>
            <Input
              id="smtp_port"
              type="number"
              value={smtpPort}
              onChange={e => {
                setSmtpPort(e.target.value);
                updateSetting('smtp_port', e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="smtp_username">SMTP Username</Label>
            <Input
              id="smtp_username"
              type="text"
              value={smtpUsername}
              onChange={e => {
                setSmtpUsername(e.target.value);
                updateSetting('smtp_username', e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="smtp_password">SMTP Password</Label>
            <Input
              id="smtp_password"
              type="password"
              value={smtpPassword}
              onChange={e => {
                setSmtpPassword(e.target.value);
                updateSetting('smtp_password', e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="smtp_from_email">SMTP From Email</Label>
            <Input
              id="smtp_from_email"
              type="email"
              value={smtpFromEmail}
              onChange={e => {
                setSmtpFromEmail(e.target.value);
                updateSetting('smtp_from_email', e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="smtp_from_name">SMTP From Name</Label>
            <Input
              id="smtp_from_name"
              type="text"
              value={smtpFromName}
              onChange={e => {
                setSmtpFromName(e.target.value);
                updateSetting('smtp_from_name', e.target.value);
              }}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>System Administrator Email</CardTitle>
          <CardDescription>
            This email address will receive error notifications from the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="admin_email">Admin Email</Label>
              <Input id="admin_email" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
            </div>
            <Button onClick={handleAdminEmailSave}>Save</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Error Alert Level</CardTitle>
          <CardDescription>
            Choose the error severity for which email alerts will be sent to the system administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <select
              className="border rounded px-3 py-2"
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value)}
            >
              {ERROR_LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
            <Button onClick={handleAlertLevelSave}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
