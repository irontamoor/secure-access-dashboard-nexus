
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DatabaseStatus = () => {
  const [ldapStatus, setLdapStatus] = useState<{ sync_time: string; status: string } | null>(null);
  const [smtpStatus, setSmtpStatus] = useState<{ connected: boolean } | null>(null);

  useEffect(() => {
    // Fetch last LDAP sync
    supabase
      .from('ldap_sync_log')
      .select('*')
      .order('sync_started_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length) {
          setLdapStatus({
            sync_time: data[0].sync_completed_at || data[0].sync_started_at,
            status: data[0].sync_status,
          });
        }
      });

    // Fetch SMTP status (check for SMTP is connected by checking config presence)
    supabase
      .from('system_settings')
      .select('*')
      .in('setting_key', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password'])
      .then(({ data }) => {
        if (
          data &&
          data.some((s) => s.setting_value && s.setting_value.trim())
        ) {
          setSmtpStatus({ connected: true });
        } else {
          setSmtpStatus({ connected: false });
        }
      });

    // No failed_emails table fetch here, since it doesn't exist in the types
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LDAP Sync Section */}
        <div className="bg-white/80 rounded-xl shadow p-6">
          <div className="font-semibold text-gray-700 mb-1">Last LDAP Sync</div>
          {ldapStatus ? (
            <>
              <div className="text-blue-700 font-mono text-lg">{ldapStatus.sync_time ? new Date(ldapStatus.sync_time).toLocaleString() : "Never"}</div>
              <div className={`text-xs ${ldapStatus.status === "completed" ? "text-green-600" : "text-red-600"}`}>
                Status: {ldapStatus.status}
              </div>
            </>
          ) : (
            <div className="text-gray-500">No LDAP syncs found</div>
          )}
        </div>
        {/* SMTP Section */}
        <div className="bg-white/80 rounded-xl shadow p-6">
          <div className="font-semibold text-gray-700 mb-1">SMTP Connection</div>
          {smtpStatus === null ? (
            <div className="text-gray-500">Checking...</div>
          ) : smtpStatus.connected ? (
            <div className="text-green-700 font-mono">Connected</div>
          ) : (
            <div className="text-red-600 font-mono">Not Connected</div>
          )}
        </div>
      </div>
      {/* Removed failed emails section because table does not exist */}
    </div>
  );
};

export default DatabaseStatus;
