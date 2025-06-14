
import { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types/database';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      // First try local admin login
      const { data: settings } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['local_admin_enabled', 'local_admin_username', 'local_admin_password']);

      const localAdminEnabled = settings?.find(s => s.setting_key === 'local_admin_enabled')?.setting_value === 'true';
      const localAdminUsername = settings?.find(s => s.setting_key === 'local_admin_username')?.setting_value;
      const localAdminPassword = settings?.find(s => s.setting_key === 'local_admin_password')?.setting_value;

      if (localAdminEnabled && username === localAdminUsername && password === localAdminPassword) {
        const localAdminUser: User = {
          id: 'local-admin',
          username: 'localadmin',
          email: 'admin@local',
          name: 'Local Administrator',
          role: 'admin',
          pin: '0000',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setCurrentUser(localAdminUser);
        localStorage.setItem('currentUser', JSON.stringify(localAdminUser));
        toast({
          title: "Login Successful",
          description: `Welcome, Local Administrator!`,
        });
        return;
      }

      // Try database login
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('pin', password)
        .single();

      if (error || !user) {
        toast({
          title: "Login Failed",
          description: "Invalid username or PIN",
          variant: "destructive",
        });
        return;
      }

      // Update last access
      await supabase
        .from('users')
        .update({ last_access: new Date().toISOString() })
        .eq('id', user.id);

      // Type assertion for the role field
      const typedUser: User = {
        ...user,
        role: user.role as 'admin' | 'staff'
      };

      setCurrentUser(typedUser);
      localStorage.setItem('currentUser', JSON.stringify(typedUser));
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login. Using local admin if available.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentUser.role === 'admin' ? (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <StaffDashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Index;
