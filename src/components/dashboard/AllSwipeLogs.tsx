
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

function convertToCsv(logs: AllSwipe[]) {
  if (!logs.length) return '';
  const header = [
    'id','user_id','door_id','access_type','pin_used','swipe_type','timestamp','notes'
  ];
  const rows = logs.map(l =>
    header.map(k => {
      const val = (l as any)[k];
      // Handle commas/double-quotes/newlines
      if (val === null || val === undefined) return '';
      return `"${(String(val)).replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [header.join(','), ...rows].join('\r\n');
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

  const handleExport = () => {
    const csv = convertToCsv(logs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swipe_logs_${new Date().toISOString().substring(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 mb-1">All Swipe Logs (Last 100)</h3>
        <button
          className="text-xs px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-200 ml-2"
          onClick={handleExport}
          disabled={loading || logs.length === 0}
        >
          Export to CSV
        </button>
      </div>
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
