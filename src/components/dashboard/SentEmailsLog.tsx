
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SentEmail {
  id: string;
  sent_at: string;
  to_email: string;
  subject: string;
  status: string;
  error_message: string | null;
  smtp_log_id: string | null;
  user_id: string | null;
}

function convertToCsv(emails: SentEmail[]) {
  if (!emails.length) return '';
  const header = [
    'id','sent_at','to_email','subject','status','error_message','smtp_log_id','user_id'
  ];
  const rows = emails.map(e =>
    header.map(k => {
      let val = (e as any)[k];
      if (val === null || val === undefined) return '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [header.join(','), ...rows].join('\r\n');
}

export default function SentEmailsLog() {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('sent_emails')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setEmails(data || []);
        setLoading(false);
      });
  }, []);

  const handleExport = () => {
    const csv = convertToCsv(emails);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sent_emails_${new Date().toISOString().substring(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 mb-1">Sent Email Log</h3>
        <button
          className="text-xs px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-200 ml-2"
          onClick={handleExport}
          disabled={loading || emails.length === 0}
        >
          Export to CSV
        </button>
      </div>
      <div className="overflow-auto max-h-64">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : emails.length === 0 ? (
          <div className="text-gray-400">No sent emails found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left font-medium">Sent At</th>
                <th className="px-2 py-1 text-left font-medium">To</th>
                <th className="px-2 py-1 text-left font-medium">Subject</th>
                <th className="px-2 py-1 text-left font-medium">Status</th>
                <th className="px-2 py-1 text-left font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr key={email.id}>
                  <td className="px-2 py-1">{new Date(email.sent_at).toLocaleString()}</td>
                  <td className="px-2 py-1">{email.to_email}</td>
                  <td className="px-2 py-1">{email.subject}</td>
                  <td className="px-2 py-1">
                    <span className={`font-bold ${email.status === 'sent' ? 'text-green-700' : 'text-red-700'}`}>
                      {email.status}
                    </span>
                  </td>
                  <td className="px-2 py-1 break-all font-mono text-xs">{email.error_message || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
