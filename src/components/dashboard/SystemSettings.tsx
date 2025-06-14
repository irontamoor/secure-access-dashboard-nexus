import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Database, Shield } from 'lucide-react';
import type { SystemSetting } from '@/types/database';
import SmtpSettingsCard from "./system-settings/SmtpSettingsCard";
import { Image } from "lucide-react";

const SystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      const settingsMap = data.reduce((acc: Record<string, string>, setting: any) => {
        acc[setting.setting_key] = setting.setting_value || '';
        return acc;
      }, {});
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key);

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Setting Updated",
        description: `${key} has been updated successfully`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  const testSMTPConnection = async () => {
    toast({
      title: "SMTP Test",
      description: "Testing SMTP connection... (This would send a test email)",
    });
  };

  // Company branding states
  const [companyLogo, setCompanyLogo] = useState(settings.company_logo_url || "");
  const [companyName, setCompanyName] = useState(settings.company_name || "");
  const [savingCompanySettings, setSavingCompanySettings] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCompanyLogo(settings.company_logo_url || "");
    setCompanyName(settings.company_name || "");
  }, [settings]);

  // New: Upload logo image to Supabase Storage
  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast({ title: "No file selected", description: "Please select a logo image file." });
      return;
    }
    setUploadingLogo(true);
    try {
      // Use filename based on upload time to avoid cache/collision issues
      const fileExt = logoFile.name.split('.').pop();
      const filePath = `logo.${Date.now()}.${fileExt}`;

      // Upload to Supabase storage bucket
      const { data, error } = await supabase.storage
        .from('company-logos')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase
        .storage
        .from('company-logos')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to get public URL for logo");
      }

      await updateSetting("company_logo_url", publicUrlData.publicUrl);
      setCompanyLogo(publicUrlData.publicUrl);

      toast({
        title: "Logo Uploaded",
        description: "Company logo was uploaded and saved.",
      });
      setLogoFile(null);

      // Reset input value for file
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      toast({
        title: "Logo Upload Failed",
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCompanyNameSave = async () => {
    setSavingCompanySettings(true);
    await updateSetting("company_name", companyName);
    setSavingCompanySettings(false);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600">Configure SMTP, security, company branding, and system preferences</p>
      </div>
      <div className="grid gap-6">
        {/* Company Branding */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg px-6 py-5">
          <div className="flex items-center space-x-3 mb-4">
            <Image className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">Company Branding</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Logo Upload */}
            <div>
              <label htmlFor="company_logo_upload" className="block text-sm font-medium mb-1">
                Company Logo
              </label>
              <input
                ref={fileInputRef}
                id="company_logo_upload"
                type="file"
                accept="image/*"
                disabled={uploadingLogo}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setLogoFile(e.target.files[0]);
                  }
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white cursor-pointer"
              />
              <div className="flex items-center mt-2 space-x-2">
                <Button size="sm" type="button" onClick={handleLogoUpload} disabled={uploadingLogo || !logoFile}>
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </Button>
                {(companyLogo || settings.company_logo_url) && (
                  <img
                    src={companyLogo}
                    alt="Company Logo Preview"
                    className="h-10 shadow border bg-white rounded p-1"
                    style={{ maxWidth: 80 }}
                  />
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">Upload a PNG, JPG, or SVG. Max size 2MB.</div>
            </div>
            {/* Company Name */}
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium mb-1">
                Company Name
              </label>
              <input
                id="company_name"
                type="text"
                placeholder="Your Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                autoComplete="off"
              />
              <div className="mt-2">
                <Button size="sm" onClick={handleCompanyNameSave} disabled={savingCompanySettings}>
                  Save Name
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Existing SMTP Section */}
        <SmtpSettingsCard
          settings={settings}
          setSettings={setSettings}
          updateSetting={updateSetting}
          testSMTPConnection={testSMTPConnection}
        />
      </div>
    </div>
  );
};

export default SystemSettings;
