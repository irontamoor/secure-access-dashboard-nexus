
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from './DashboardHeader';
import ActivityLogs from './ActivityLogs';
import PinManagement from './PinManagement';
import { Calendar, Key, User } from 'lucide-react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  name: string;
  pin?: string;
}

interface StaffDashboardProps {
  user: User;
  onLogout: () => void;
}

const StaffDashboard = ({ user, onLogout }: StaffDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600 mt-2">View your access history and manage your PIN</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pin" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              My PIN
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              My Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Current PIN</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">••••</div>
                  <p className="text-xs text-gray-500">Last changed 5 days ago</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Today's Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <p className="text-xs text-gray-500">Door entries</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Access Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">Staff</div>
                  <p className="text-xs text-gray-500">Standard access</p>
                </CardContent>
              </Card>
            </div>
            
            <ActivityLogs isAdmin={false} userId={user.id} />
          </TabsContent>

          <TabsContent value="pin">
            <PinManagement isAdmin={false} userId={user.id} />
          </TabsContent>

          <TabsContent value="logs">
            <ActivityLogs isAdmin={false} userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StaffDashboard;
