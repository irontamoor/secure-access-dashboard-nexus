
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Image } from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  name: string;
  pin?: string;
}

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
}

const fetchBrandingSettings = async (): Promise<{ logoUrl?: string; companyName?: string }> => {
  // Use Supabase from window or fallback
  try {
    const supabase = (window as any).supabase;
    if (!supabase) return {};
    const { data, error } = await supabase.from('system_settings').select('setting_key, setting_value');
    if (error || !Array.isArray(data)) return {};
    let logoUrl = undefined, companyName = undefined;
    data.forEach((s: any) => {
      if (s.setting_key === 'company_logo_url') logoUrl = s.setting_value;
      if (s.setting_key === 'company_name') companyName = s.setting_value;
    });
    return { logoUrl, companyName };
  } catch (e) {
    return {};
  }
};

const DashboardHeader = ({ user, onLogout }: DashboardHeaderProps) => {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [companyName, setCompanyName] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Get from global context if possible for optimum, else fallback to db fetch
    fetchBrandingSettings().then(res => {
      if (res.logoUrl) setLogoUrl(res.logoUrl);
      if (res.companyName) setCompanyName(res.companyName);
    });
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Show logo if present, fallback to default avatar */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Company Logo"
                className="w-12 h-12 object-contain bg-white rounded-full ring-1 ring-gray-200"
                style={{ minWidth: 48, background: "#fff" }}
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {companyName || "Secure Access Dashboard"}
              </h2>
              <div className="flex items-center space-x-2">
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500">@{user.username}</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={onLogout} 
            variant="outline" 
            size="sm" 
            className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
