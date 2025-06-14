import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from './DashboardHeader';
import DatabaseStatus from './DatabaseStatus';
import UserManagement from './UserManagement';
import DoorManagement from './DoorManagement';
import ActivityLogs from './ActivityLogs';
import SystemSettings from './SystemSettings';
import DatabaseSettings from './DatabaseSettings';
import DoorPermissions from './DoorPermissions';
import EmailNotifications from './EmailNotifications';
import PinManagement from './PinManagement';
import type { User } from '@/types/database';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader user={user} onLogout={onLogout} />
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="doors">Doors</TabsTrigger>
            <TabsTrigger value="logs">Activity</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <DatabaseStatus />
          </TabsContent>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="doors">
            <DoorManagement />
          </TabsContent>
          <TabsContent value="logs">
            <ActivityLogs isAdmin={true} userId={user.id} />
          </TabsContent>
          <TabsContent value="notifications">
            <EmailNotifications />
          </TabsContent>
          <TabsContent value="database">
            <DatabaseSettings />
          </TabsContent>
          <TabsContent value="system">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
