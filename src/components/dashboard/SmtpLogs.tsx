
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SmtpLog {
  id: string;
  timestamp: string;
  event_type: string;
  status: string | null;
  details: any;
  user_id: string | null;
}

export default function SmtpLogs() {
  const [logs, setLogs] = useState<SmtpLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('smtp_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setLogs(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mb-10">
      <h3 className="font-semibold text-gray-700 mb-1">Recent SMTP Logs</h3>
      <div className="overflow-auto max-h-64">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-400">No SMTP logs found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left font-medium">Time</th>
                <th className="px-2 py-1 text-left font-medium">Event</th>
                <th className="px-2 py-1 text-left font-medium">Status</th>
                <th className="px-2 py-1 text-left font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-2 py-1">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-2 py-1">{log.event_type}</td>
                  <td className="px-2 py-1">{log.status || '—'}</td>
                  <td className="px-2 py-1 whitespace-pre-line break-all">
                    <span className="font-mono text-xs">
                      {log.details ? JSON.stringify(log.details, null, 1) : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
