
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

  return (
    <div className="mb-10">
      <h3 className="font-semibold text-gray-700 mb-1">Sent Email Log</h3>
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
