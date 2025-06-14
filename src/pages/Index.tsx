
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
      // Only allow database (users table) login, no more localadmin flow
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
        description: "An error occurred during login. Please try again.",
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

  // THE KEY LOGIC: show admin dashboard for admins, staff dashboard for staff
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

