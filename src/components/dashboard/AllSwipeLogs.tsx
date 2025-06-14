
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AllSwipe {
  id: string;
  user_id: string | null;
  door_id: string | null;
  access_type: string;
  pin_used: string | null;
  swipe_type: string | null;
  timestamp: string;
  notes: string | null;
}

export default function AllSwipeLogs() {
  const [logs, setLogs] = useState<AllSwipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('access_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setLogs(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mb-10">
      <h3 className="font-semibold text-gray-700 mb-1">All Swipe Logs (Last 100)</h3>
      <div className="overflow-auto max-h-64">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-400">No swipes found.</div>
        ) : (
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left font-medium">Time</th>
                <th className="px-2 py-1 text-left font-medium">User/Card</th>
                <th className="px-2 py-1 text-left font-medium">Door</th>
                <th className="px-2 py-1 text-left font-medium">Access</th>
                <th className="px-2 py-1 text-left font-medium">Swipe Type</th>
                <th className="px-2 py-1 text-left font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-2 py-1">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-2 py-1">{log.user_id || log.pin_used || '—'}</td>
                  <td className="px-2 py-1">{log.door_id || '—'}</td>
                  <td className="px-2 py-1">{log.access_type}</td>
                  <td className="px-2 py-1">{log.swipe_type || '—'}</td>
                  <td className="px-2 py-1">{log.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
