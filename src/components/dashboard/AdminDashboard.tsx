
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from './DashboardHeader';
import UserManagement from './UserManagement';
import DoorManagement from './DoorManagement';
import ActivityLogs from './ActivityLogs';
import PinManagement from './PinManagement';
import SystemSettings from './SystemSettings';
import DatabaseStatus from './DatabaseStatus';
import { Users, Settings, Calendar, Key, Database, Mail } from 'lucide-react';
import type { User } from '@/types/database';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage doors, users, and access control</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="doors" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Doors
            </TabsTrigger>
            <TabsTrigger value="pins" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              PINs
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DatabaseStatus />
            <ActivityLogs isAdmin={true} userId={user.id} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="doors">
            <DoorManagement />
          </TabsContent>

          <TabsContent value="pins">
            <PinManagement isAdmin={true} />
          </TabsContent>

          <TabsContent value="logs">
            <ActivityLogs isAdmin={true} userId={user.id} />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseStatus />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
