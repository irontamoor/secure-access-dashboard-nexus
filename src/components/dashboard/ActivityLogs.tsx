
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Settings, Lock } from 'lucide-react';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  doorId: string;
  doorName: string;
  action: 'access_granted' | 'access_denied' | 'door_locked' | 'door_unlocked';
  timestamp: string;
  pinUsed?: string;
  result: 'success' | 'failed';
}

interface ActivityLogsProps {
  isAdmin: boolean;
  userId: string;
}

const ActivityLogs = ({ isAdmin, userId }: ActivityLogsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterResult, setFilterResult] = useState('all');

  // TODO: Replace with real logs from backend
  const [logs] = useState<ActivityLog[]>([]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = isAdmin 
      ? (log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         log.doorName.toLowerCase().includes(searchTerm.toLowerCase()))
      : log.userId === userId;
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesResult = filterResult === 'all' || log.result === filterResult;
    
    return matchesSearch && matchesAction && matchesResult;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'access_granted':
      case 'access_denied':
        return <User className="w-4 h-4" />;
      case 'door_locked':
      case 'door_unlocked':
        return <Lock className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string, result: string) => {
    if (result === 'failed') return 'bg-red-100 text-red-800';
    
    switch (action) {
      case 'access_granted':
        return 'bg-green-100 text-green-800';
      case 'access_denied':
        return 'bg-red-100 text-red-800';
      case 'door_unlocked':
        return 'bg-blue-100 text-blue-800';
      case 'door_locked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isAdmin ? 'Activity Logs' : 'My Activity'}
        </h2>
        <p className="text-gray-600">
          {isAdmin ? 'Monitor all door access activity' : 'View your door access history'}
        </p>
      </div>

      {isAdmin && (
        <div className="flex space-x-4 mb-6">
          <Input
            placeholder="Search by user or door name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="access_granted">Access Granted</SelectItem>
              <SelectItem value="access_denied">Access Denied</SelectItem>
              <SelectItem value="door_locked">Door Locked</SelectItem>
              <SelectItem value="door_unlocked">Door Unlocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterResult} onValueChange={setFilterResult}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(log.action, log.result)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      {isAdmin && (
                        <span className="font-medium text-gray-900">{log.userName}</span>
                      )}
                      <Badge className={getActionColor(log.action, log.result)}>
                        {formatAction(log.action)}
                      </Badge>
                      <span className="text-gray-600">→</span>
                      <span className="font-medium text-gray-900">{log.doorName}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{log.timestamp}</span>
                      {log.pinUsed && (
                        <>
                          <span>•</span>
                          <span>PIN: ••••</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <Badge variant={log.result === 'success' ? 'default' : 'destructive'}>
                  {log.result.charAt(0).toUpperCase() + log.result.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
            <p className="text-gray-600">
              {isAdmin 
                ? 'No activity logs match your search criteria.'
                : 'You haven\'t accessed any doors yet.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivityLogs;
