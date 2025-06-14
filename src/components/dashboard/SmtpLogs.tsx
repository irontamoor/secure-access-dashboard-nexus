
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SmtpLog {
  id: string;
  timestamp: string;
  event_type: string;
  status: string | null;
  details: any;
  user_id: string | null;
}

function convertToCsv(logs: SmtpLog[]) {
  if (!logs.length) return '';
  const header = [
    'id','timestamp','event_type','status','details','user_id'
  ];
  const rows = logs.map(l =>
    header.map(k => {
      let val = (l as any)[k];
      if (k === "details") val = JSON.stringify(val ?? '');
      if (val === null || val === undefined) return '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [header.join(','), ...rows].join('\r\n');
}

type SmtpLogsProps = {
  hideExport?: boolean;
};

// using forwardRef so parent can trigger csv export
const SmtpLogs = forwardRef<{ getCsv: () => string }, SmtpLogsProps>(
  function SmtpLogs({ hideExport = false }, ref) {
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

    useImperativeHandle(ref, () => ({
      getCsv: () => convertToCsv(logs)
    }));

    return (
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 mb-1">Recent SMTP Logs</h3>
          {!hideExport && (
          <button
            className="text-xs px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-200 ml-2"
            onClick={() => {
              const csv = convertToCsv(logs);
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `smtp_logs_${new Date().toISOString().substring(0,10)}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            disabled={loading || logs.length === 0}
          >
            Export to CSV
          </button>
          )}
        </div>
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
);

export default SmtpLogs;
