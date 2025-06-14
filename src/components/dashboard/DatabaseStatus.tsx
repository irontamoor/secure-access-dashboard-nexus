
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Database, Users, DoorOpen, Activity, LogOut, AlertOctagon } from 'lucide-react';

const DatabaseStatus = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoors: 0,
    todayLogs: 0,
    isConnected: false,
    signedInUsers: 0,
    failedUsers: 0,
  });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
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
      {/* New Card: Signed in users */}
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
      {/* New Card: Users failed access */}
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
    </div>
  );
};

export default DatabaseStatus;
