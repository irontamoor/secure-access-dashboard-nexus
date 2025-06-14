
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DoorCounts {
  [location: string]: number;
}

export default function DatabaseStatus() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [doorCount, setDoorCount] = useState<number | null>(null);
  const [failedUsers, setFailedUsers] = useState<any[]>([]);
  const [swipeCount, setSwipeCount] = useState<number | null>(null);
  const [swipesByLocation, setSwipesByLocation] = useState<DoorCounts>({});
  const [ldapStatus, setLdapStatus] = useState<{ sync_time: string; status: string } | null>(null);
  const [smtpStatus, setSmtpStatus] = useState<{ connected: boolean } | null>(null);

  useEffect(() => {
    // 1. Get user count
    supabase.from('users').select('id', { count: 'exact', head: true }).then(({ count }) => {
      setUserCount(count ?? 0);
    });
    // 2. Get door count
    supabase.from('doors').select('id', { count: 'exact', head: true }).then(({ count }) => {
      setDoorCount(count ?? 0);
    });
    // 3. Get failed users
    supabase.from('users').select('id, name, email, username').eq('disabled', true).then(({ data }) => {
      setFailedUsers(data || []);
    });
    // 4. Get swipe count (number of accesses) in last 24h & breakdown by door location
    (async () => {
      const now = new Date();
      const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      // Get logs in last 24h
      const { data: logs } = await supabase
        .from('access_logs')
        .select('id,door_id,timestamp')
        .gte('timestamp', since.toISOString());

      setSwipeCount(logs?.length || 0);

      // Group by door location
      if (logs && logs.length > 0) {
        // Fetch doors info for log grouping
        const { data: doors } = await supabase.from('doors').select('id,location');
        const doorMap = (doors || []).reduce((acc, d) => ({ ...acc, [d.id]: d.location }), {});
        const locationCounts: DoorCounts = {};
        for (const log of logs) {
          const loc = doorMap[log.door_id] || 'Unknown';
          locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        }
        setSwipesByLocation(locationCounts);
      } else {
        setSwipesByLocation({});
      }
    })();

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
        if (data && data.some((s) => s.setting_value && s.setting_value.trim())) {
          setSmtpStatus({ connected: true });
        } else {
          setSmtpStatus({ connected: false });
        }
      });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
      {/* Core system stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* User count */}
        <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="font-semibold text-gray-700 mb-1">Total Users</div>
          <div className="text-3xl font-bold text-blue-700">{userCount !== null ? userCount : '—'}</div>
        </div>
        {/* Door count */}
        <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="font-semibold text-gray-700 mb-1">Total Doors</div>
          <div className="text-3xl font-bold text-green-700">{doorCount !== null ? doorCount : '—'}</div>
        </div>
        {/* Swipes total */}
        <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="font-semibold text-gray-700 mb-1">Swipes (24h)</div>
          <div className="text-3xl font-bold text-purple-700">{swipeCount !== null ? swipeCount : '—'}</div>
        </div>
        {/* Failed users */}
        <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="font-semibold text-gray-700 mb-1">Disabled Users</div>
          <div className="text-3xl font-bold text-red-700">{failedUsers.length}</div>
        </div>
      </div>
      {/* Breakdown/swipe by location */}
      <div className="mb-8">
        <div className="font-semibold text-gray-700 mb-2">Swipes by Area (24h)</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.keys(swipesByLocation).length === 0 ? (
            <div className="text-gray-500">No swipes in the last 24 hours.</div>
          ) : (
            Object.entries(swipesByLocation).map(([loc, count]) => (
              <div key={loc} className="bg-white/60 rounded-lg p-4 shadow border">
                <div className="font-medium text-gray-800">{loc}</div>
                <div className="text-blue-600 text-xl font-bold">{count} swipes</div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Failed users list */}
      <div className="mb-8">
        <div className="font-semibold text-gray-700 mb-2">Disabled Users List</div>
        <div className="overflow-auto max-h-48">
          {failedUsers.length === 0 ? (
            <div className="text-gray-500">No disabled users.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left font-medium">ID</th>
                  <th className="px-2 py-1 text-left font-medium">Username</th>
                  <th className="px-2 py-1 text-left font-medium">Name</th>
                  <th className="px-2 py-1 text-left font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {failedUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="px-2 py-1">{u.id}</td>
                    <td className="px-2 py-1">{u.username}</td>
                    <td className="px-2 py-1">{u.name}</td>
                    <td className="px-2 py-1">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LDAP Sync Section */}
        <div className="bg-white/80 rounded-xl shadow p-6">
          <div className="font-semibold text-gray-700 mb-1">Last LDAP Sync</div>
          {ldapStatus ? (
            <>
              <div className="text-blue-700 font-mono text-lg">
                {ldapStatus.sync_time
                  ? new Date(ldapStatus.sync_time).toLocaleString()
                  : "Never"}
              </div>
              <div
                className={`text-xs ${
                  ldapStatus.status === "completed"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
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
    </div>
  );
}
