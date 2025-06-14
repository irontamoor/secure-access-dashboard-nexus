
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';
import type { LdapSyncLog } from '@/types/database';

interface Props {
  syncLogs: LdapSyncLog[];
}

const SyncHistoryCard = ({ syncLogs }: Props) => (
  <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Database className="w-5 h-5" />
        <span>Sync History</span>
      </CardTitle>
      <CardDescription>
        Recent LDAP synchronization logs
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {syncLogs.map((log) => (
          <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">
                {new Date(log.sync_started_at).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Status: {log.sync_status} | Users: {log.users_synced || 0} | Errors: {log.errors_count || 0}
              </p>
              {log.error_details && (
                <p className="text-sm text-red-600">{log.error_details}</p>
              )}
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              log.sync_status === 'completed' ? 'bg-green-100 text-green-800' :
              log.sync_status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {log.sync_status}
            </div>
          </div>
        ))}
        {syncLogs.length === 0 && (
          <p className="text-gray-500 text-center py-4">No sync logs available</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default SyncHistoryCard;
