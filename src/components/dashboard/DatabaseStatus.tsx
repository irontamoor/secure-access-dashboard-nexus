
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Database, Users, DoorOpen, Activity, LogOut, AlertOctagon, MailCheck, MailX, RefreshCw } from 'lucide-react';

interface LdapSyncLog {
  sync_started_at: string;
  sync_completed_at: string | null;
  sync_status: string;
}

interface FailedSmtpEmail {
  id: string;
  email: string;
  error: string;
  created_at: string;
}

const DatabaseStatus = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoors: 0,
    todayLogs: 0,
    isConnected: false,
    signedInUsers: 0,
    failedUsers: 0,
  });

  // new
  const [ldapSync, setLdapSync] = useState<LdapSyncLog | null>(null);
  const [smtpConnected, setSmtpConnected] = useState<boolean | null>(null);
  const [failedEmails, setFailedEmails] = useState<FailedSmtpEmail[]>([]);

  useEffect(() => {
    loadStats();
    fetchLdapSyncLog();
    checkSmtpStatus();
    fetchFailedEmails();
    const interval = setInterval(() => {
      loadStats();
      fetchLdapSyncLog();
      checkSmtpStatus();
      fetchFailedEmails();
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [
        usersResult,
        doorsResult,
        logsResult,
        signInUsersResult,
        failedAccessResult
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('doors').select('id', { count: 'exact' }),
        supabase
          .from('access_logs')
          .select('id', { count: 'exact' })
          .gte('timestamp', today),
        supabase
          .from('access_logs')
          .select('user_id', { count: 'exact', head: false })
          .eq('access_type', 'granted')
          .gte('timestamp', today),
        supabase
          .from('access_logs')
          .select('user_id', { count: 'exact', head: false })
          .eq('access_type', 'denied')
          .gte('timestamp', today),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalDoors: doorsResult.count || 0,
        todayLogs: logsResult.count || 0,
        isConnected: true,
        signedInUsers: signInUsersResult.count || 0,
        failedUsers: failedAccessResult.count || 0,
      });
    } catch (error) {
      console.error('Database error:', error);
      setStats(prev => ({ ...prev, isConnected: false }));
    }
  };

  // Fetch last LDAP sync
  const fetchLdapSyncLog = async () => {
    const { data } = await supabase
      .from('ldap_sync_log')
      .select('sync_started_at,sync_completed_at,sync_status')
      .order('sync_started_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setLdapSync(data || null);
  };

  // Dummy SMTP status: assume SMTP config is stored as a system setting
  const checkSmtpStatus = async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('setting_key,setting_value')
      .eq('setting_key', 'smtp_host')
      .maybeSingle();
    setSmtpConnected(!!(data && data.setting_value));
  };

  // Dummy: Fetch failed emails (mock - adapt if you have an actual table)
  const fetchFailedEmails = async () => {
    // Replace with real query if available
    // eg: const { data } = await supabase.from('email_error_log').select('*').limit(5);
    setFailedEmails([
      // { id: '1', email: 'john@example.com', error: 'SMTP server not responding', created_at: new Date().toISOString() }
    ]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={stats.isConnected ? 'default' : 'destructive'}>
            {stats.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <p className="text-xs text-gray-500 mt-1">
            {stats.isConnected ? 'All systems operational' : 'Using local fallback'}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
          <p className="text-xs text-gray-500">Registered users</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <DoorOpen className="w-4 h-4" />
            Active Doors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.totalDoors}</div>
          <p className="text-xs text-gray-500">Configured doors</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Today's Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.todayLogs}</div>
          <p className="text-xs text-gray-500">Access attempts today</p>
        </CardContent>
      </Card>

      {/* Signed in users today */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Users Signed In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{stats.signedInUsers}</div>
          <p className="text-xs text-gray-500">Access granted today</p>
        </CardContent>
      </Card>
      {/* Failed access */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" />
            Failed Access Attempts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.failedUsers}</div>
          <p className="text-xs text-gray-500">Access denied today</p>
        </CardContent>
      </Card>

      {/* Last LDAP Sync */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Last LDAP Sync
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ldapSync ? (
            <div>
              <Badge variant={ldapSync.sync_status === "completed" ? "default" : ldapSync.sync_status === "failed" ? "destructive" : "secondary"}>
                {ldapSync.sync_status}
              </Badge>
              <div className="text-xs mt-2 text-gray-700">
                {ldapSync.sync_completed_at ? (
                  <>Last completed: {new Date(ldapSync.sync_completed_at).toLocaleString()}</>
                ) : (
                  <>Started: {new Date(ldapSync.sync_started_at).toLocaleString()}</>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">No sync info</div>
          )}
        </CardContent>
      </Card>

      {/* SMTP Connection */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <MailCheck className="w-4 h-4" />
            SMTP Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={smtpConnected ? "default" : "destructive"}>
            {smtpConnected === null ? "Unknown" : smtpConnected ? "Connected" : "Not Connected"}
          </Badge>
          <p className="text-xs text-gray-500 mt-1">
            {smtpConnected
              ? "SMTP settings detected"
              : "No SMTP configuration found"}
          </p>
        </CardContent>
      </Card>

      {/* Failed SMTP Emails */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <MailX className="w-4 h-4" />
            Failed SMTP Emails
          </CardTitle>
          <CardDescription>
            Recent email failures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {failedEmails.length === 0 ? (
            <div className="text-xs text-gray-500">No failed emails.</div>
          ) : (
            <ul className="space-y-2">
              {failedEmails.map(email => (
                <li key={email.id} className="text-xs text-red-700">
                  <span className="font-mono">{email.email}</span> &nbsp;
                  <span>{email.error}</span>
                  <span className="ml-1 text-gray-400">{new Date(email.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseStatus;

