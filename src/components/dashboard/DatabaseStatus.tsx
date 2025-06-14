import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types
interface DoorCounts {
  [location: string]: number;
}

import SmtpLogs from './SmtpLogs';

export default function DatabaseStatus() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [doorCount, setDoorCount] = useState<number | null>(null);
  const [failedUsers, setFailedUsers] = useState<any[]>([]);
  const [swipeCount, setSwipeCount] = useState<number | null>(null);
  const [swipesByLocation, setSwipesByLocation] = useState<DoorCounts>({});
  const [failedSwipes, setFailedSwipes] = useState<any[]>([]);
  const [failedSwipesByLocation, setFailedSwipesByLocation] = useState<DoorCounts>({});
  const [ldapStatus, setLdapStatus] = useState<{ sync_time: string; status: string } | null>(null);
  const [smtpStatus, setSmtpStatus] = useState<{ connected: boolean } | null>(null);
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "not_connected">("checking");

  useEffect(() => {
    // Database connection check
    const checkDbConnection = async () => {
      setDbStatus("checking");
      try {
        const { error } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true });
        if (!error) setDbStatus("connected");
        else setDbStatus("not_connected");
      } catch {
        setDbStatus("not_connected");
      }
    };
    checkDbConnection();

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

    // FAILED SWIPES (access denied in last 24h)
    (async () => {
      const now = new Date();
      const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get denied logs in last 24h
      const { data: deniedLogs } = await supabase
        .from('access_logs')
        .select('id,user_id,door_id,access_type,pin_used,timestamp,notes')
        .eq('access_type', 'denied')
        .gte('timestamp', since.toISOString())
        .order('timestamp', { ascending: false });

      if (deniedLogs && deniedLogs.length > 0) {
        // Fetch all related data needed
        const userIds = Array.from(new Set(deniedLogs
          .map(log => log.user_id)
          .filter(Boolean)
        ));
        const doorIds = Array.from(new Set(deniedLogs
          .map(log => log.door_id)
          .filter(Boolean)
        ));
        const pins = Array.from(new Set(deniedLogs
          .map(l => l.pin_used)
          .filter(Boolean)
        ));

        // Fetch users
        let users: any[] = [];
        if (userIds.length > 0) {
          const usersRes = await supabase
            .from('users')
            .select('id,username,name,email,disabled,card_number,pin_disabled')
            .in('id', userIds);
          users = usersRes.data || [];
        }

        // Fetch doors
        let doors: any[] = [];
        if (doorIds.length > 0) {
          const doorsRes = await supabase
            .from('doors')
            .select('id,location');
          doors = doorsRes.data || [];
        }

        // Group failed swipes by location
        const doorMap = doors.reduce((acc, d) => ({ ...acc, [d.id]: d.location }), {});
        const locCounts: DoorCounts = {};
        for (const log of deniedLogs) {
          const loc = doorMap[log.door_id] || 'Unknown';
          locCounts[loc] = (locCounts[loc] || 0) + 1;
        }
        setFailedSwipesByLocation(locCounts);

        // Prepare failed swipes log for UI
        const failedList = deniedLogs.map((log) => {
          const user = users.find(u => u.id === log.user_id);
          return {
            ...log,
            user,
            username: user?.username || '',
            name: user?.name || '',
            email: user?.email || '',
            card_number: user?.card_number || log.pin_used || null,
            user_disabled: user?.disabled || null,
            pin_disabled: user?.pin_disabled || null,
            door_location: doorMap[log.door_id] || 'Unknown'
          };
        });
        setFailedSwipes(failedList);
      } else {
        setFailedSwipes([]);
        setFailedSwipesByLocation({});
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

    // Fetch SMTP status (check for SMTP config presence)
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
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
        {/* Failed/disabled users */}
        <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="font-semibold text-gray-700 mb-1">Disabled Users</div>
          <div className="text-3xl font-bold text-red-700">{failedUsers.length}</div>
        </div>
        {/* Database connection */}
        <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="font-semibold text-gray-700 mb-1">Database Connection</div>
          {dbStatus === "checking" ? (
              <div className="text-gray-500 text-lg font-mono">Checking...</div>
            ) : dbStatus === "connected" ? (
              <div className="text-green-700 text-xl font-bold">Connected</div>
            ) : (
              <div className="text-red-700 text-xl font-bold">Not Connected</div>
            )
          }
        </div>
      </div>

      {/* Swipe Success/Failed breakdown */}
      <div className="mb-8">
        <div className="font-semibold text-gray-700 mb-2">
          Swipes by Area (24h) &nbsp;
          <span className="text-xs text-gray-400">(Successes & Failures)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Successful swipes by area */}
          {Object.keys(swipesByLocation).length === 0 ? (
            <div className="text-gray-500">No successful swipes in the last 24 hours.</div>
          ) : (
            Object.entries(swipesByLocation).map(([loc, count]) => (
              <div key={loc} className="bg-green-50 rounded-lg p-4 shadow border">
                <div className="font-medium text-gray-800">{loc}</div>
                <div className="text-green-600 text-xl font-bold">{count} success</div>
              </div>
            ))
          )}
        </div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Failed swipes by area */}
          {Object.keys(failedSwipesByLocation).length === 0 ? (
            <div className="text-gray-500">No failed swipes in the last 24 hours.</div>
          ) : (
            Object.entries(failedSwipesByLocation).map(([loc, count]) => (
              <div key={loc} className="bg-red-50 rounded-lg p-4 shadow border">
                <div className="font-medium text-gray-800">{loc}</div>
                <div className="text-red-600 text-xl font-bold">{count} failed</div>
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

      {/* Failed Swipe Log (last 24h) */}
      <div className="mb-8">
        <div className="font-semibold text-gray-700 mb-2">
          Failed Swipe Attempts (Last 24h)
        </div>
        <div className="overflow-auto max-h-64">
          {failedSwipes.length === 0 ? (
            <div className="text-gray-500">No failed swipes.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left font-medium">Time</th>
                  <th className="px-2 py-1 text-left font-medium">User/Card</th>
                  <th className="px-2 py-1 text-left font-medium">Location</th>
                  <th className="px-2 py-1 text-left font-medium">Reason</th>
                  <th className="px-2 py-1 text-left font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {failedSwipes.map((f, i) => (
                  <tr key={f.id + "_" + i}>
                    <td className="px-2 py-1">{f.timestamp ? new Date(f.timestamp).toLocaleString() : "—"}</td>
                    <td className="px-2 py-1">
                      {f.username || f.name || (f.card_number ? <span>Card: <span className="font-mono">{f.card_number}</span></span> : "Unknown")}
                      {f.user_disabled && <span className="ml-1 text-xs text-red-600">(User Disabled)</span>}
                      {f.pin_disabled && <span className="ml-1 text-xs text-yellow-600">(PIN Disabled)</span>}
                    </td>
                    <td className="px-2 py-1">{f.door_location}</td>
                    <td className="px-2 py-1">
                      {f.user_disabled
                        ? "User disabled"
                        : f.pin_disabled
                        ? "PIN disabled"
                        : !f.user
                        ? "Invalid card/user"
                        : "Denied for other reason"}
                    </td>
                    <td className="px-2 py-1">{f.notes || "—"}</td>
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

      {/* Logs have been moved to new Logs tab */}
    </div>
  );
}
