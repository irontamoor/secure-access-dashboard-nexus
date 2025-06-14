
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type LdapErrorLog = {
  id: string;
  sync_started_at: string;
  sync_completed_at: string | null;
  sync_status: string;
  error_details: string | null;
};
type SmtpErrorLog = {
  id: string;
  timestamp: string;
  event_type: string;
  status: string | null;
  details: any;
};
type SentEmailError = {
  id: string;
  sent_at: string;
  to_email: string;
  subject: string;
  status: string;
  error_message: string | null;
};

export default function SystemErrorLogs() {
  const [ldapErrors, setLdapErrors] = useState<LdapErrorLog[]>([]);
  const [smtpErrors, setSmtpErrors] = useState<SmtpErrorLog[]>([]);
  const [emailErrors, setEmailErrors] = useState<SentEmailError[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // LDAP errors: failed logs in ldap_sync_log
    supabase
      .from('ldap_sync_log')
      .select('*')
      .eq('sync_status', 'failed')
      .order('sync_started_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setLdapErrors(data || []));

    // SMTP error events: in smtp_logs where status indicates failure, or event_type=error
    supabase
      .from('smtp_logs')
      .select('*')
      .or('status.in.(failed,error),event_type.eq.error')
      .order('timestamp', { ascending: false })
      .limit(10)
      .then(({ data }) => setSmtpErrors(data || []));

    // Sent Email Failures: sent_emails where status != sent
    supabase
      .from('sent_emails')
      .select('*')
      .neq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setEmailErrors(data || []));

    // Quick DB check: select returns error if not connected
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .then(({ error }) => {
        if (error) setDbError(error.message);
        else setDbError(null);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h3 className="font-bold text-xl mb-3 text-gray-800">System Errors</h3>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-6">
          {/* Database Error */}
          <div>
            <div className="font-semibold text-gray-700">Database Connection</div>
            {dbError ? (
              <div className="bg-red-100 text-red-800 rounded p-2 mt-1">
                {dbError}
              </div>
            ) : (
              <div className="bg-green-50 text-green-700 rounded p-2 mt-1">
                No connection errors
              </div>
            )}
          </div>
          {/* LDAP Errors */}
          <div>
            <div className="font-semibold text-gray-700">LDAP Sync Issues</div>
            {ldapErrors.length === 0 ? (
              <div className="text-gray-500">No reported errors.</div>
            ) : (
              <table className="min-w-full text-sm mt-2">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left font-medium">Time</th>
                    <th className="px-2 py-1 text-left font-medium">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {ldapErrors.map(log => (
                    <tr key={log.id}>
                      <td className="px-2 py-1">{new Date(log.sync_started_at).toLocaleString()}</td>
                      <td className="px-2 py-1">{log.error_details || 'Unknown error'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* SMTP Errors */}
          <div>
            <div className="font-semibold text-gray-700">SMTP Errors</div>
            {smtpErrors.length === 0 ? (
              <div className="text-gray-500">No reported errors.</div>
            ) : (
              <table className="min-w-full text-sm mt-2">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left font-medium">Time</th>
                    <th className="px-2 py-1 text-left font-medium">Event</th>
                    <th className="px-2 py-1 text-left font-medium">Status</th>
                    <th className="px-2 py-1 text-left font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {smtpErrors.map(e => (
                    <tr key={e.id}>
                      <td className="px-2 py-1">{new Date(e.timestamp).toLocaleString()}</td>
                      <td className="px-2 py-1">{e.event_type}</td>
                      <td className="px-2 py-1">{e.status || '—'}</td>
                      <td className="px-2 py-1 break-all text-xs font-mono">{e.details ? JSON.stringify(e.details) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Email send errors */}
          <div>
            <div className="font-semibold text-gray-700">Email Send Failures</div>
            {emailErrors.length === 0 ? (
              <div className="text-gray-500">No reported issues.</div>
            ) : (
              <table className="min-w-full text-sm mt-2">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left font-medium">Time</th>
                    <th className="px-2 py-1 text-left font-medium">To</th>
                    <th className="px-2 py-1 text-left font-medium">Subject</th>
                    <th className="px-2 py-1 text-left font-medium">Status</th>
                    <th className="px-2 py-1 text-left font-medium">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {emailErrors.map(e => (
                    <tr key={e.id}>
                      <td className="px-2 py-1">{new Date(e.sent_at).toLocaleString()}</td>
                      <td className="px-2 py-1">{e.to_email}</td>
                      <td className="px-2 py-1">{e.subject}</td>
                      <td className="px-2 py-1 text-red-700">{e.status}</td>
                      <td className="px-2 py-1 break-all text-xs font-mono">{e.error_message || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
