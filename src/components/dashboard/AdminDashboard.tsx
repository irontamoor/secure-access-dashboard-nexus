
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from './DashboardHeader';
import UserManagement from './UserManagement';
import DoorManagement from './DoorManagement';
import ActivityLogs from './ActivityLogs';
import PinManagement from './PinManagement';
import { Users, Settings, Calendar, Key } from 'lucide-react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  name: string;
  pin?: string;
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage doors, users, and access control</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/60 backdrop-blur-sm">
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
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">15</div>
                  <p className="text-xs text-gray-500">+2 from last month</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Doors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <p className="text-xs text-gray-500">All operational</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Today's Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">127</div>
                  <p className="text-xs text-gray-500">+15% from yesterday</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Failed Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <p className="text-xs text-gray-500">Last 24 hours</p>
                </CardContent>
              </Card>
            </div>
            
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
