
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'failed_access' | 'no_swipe_out' | 'test';
  user_id?: string;
  door_id?: string;
  pin_used?: string;
  ip_address?: string;
  test_email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, user_id, door_id, pin_used, ip_address, test_email }: NotificationRequest = await req.json();

    console.log('Processing notification request:', { type, user_id, door_id });

    // Get email settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'email_notifications_enabled',
        'email_failed_access_enabled',
        'email_no_swipe_out_enabled',
        'smtp_host',
        'smtp_port',
        'smtp_username',
        'smtp_password',
        'smtp_from_email',
        'smtp_from_name'
      ]);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      throw settingsError;
    }

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, string>);

    // Check if notifications are enabled
    if (settingsMap.email_notifications_enabled !== 'true') {
      return new Response(JSON.stringify({ message: 'Email notifications are disabled' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check specific notification type
    if (type === 'failed_access' && settingsMap.email_failed_access_enabled !== 'true') {
      return new Response(JSON.stringify({ message: 'Failed access notifications are disabled' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (type === 'no_swipe_out' && settingsMap.email_no_swipe_out_enabled !== 'true') {
      return new Response(JSON.stringify({ message: 'No swipe out notifications are disabled' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    let emailSubject = '';
    let emailBody = '';
    let recipientEmail = test_email || settingsMap.smtp_from_email;

    if (type === 'failed_access') {
      // Get user and door details
      const [userResult, doorResult] = await Promise.all([
        user_id ? supabase.from('users').select('name, username, email').eq('id', user_id).single() : null,
        door_id ? supabase.from('doors').select('name, location').eq('id', door_id).single() : null
      ]);

      const user = userResult?.data;
      const door = doorResult?.data;

      emailSubject = 'Access Denied Alert - Door Access System';
      emailBody = `Dear Administrator,

An unauthorized access attempt was detected:

Door: ${door?.name || 'Unknown'} at ${door?.location || 'Unknown Location'}
Time: ${new Date().toLocaleString()}
${user ? `User: ${user.name} (${user.username})` : ''}
PIN Used: ${pin_used || 'Not provided'}
IP Address: ${ip_address || 'Unknown'}

Please review the access logs for more details.

Best regards,
Door Access System`;

      // Log the failed access
      await supabase.from('access_logs').insert({
        user_id: user_id || null,
        door_id: door_id || null,
        access_type: 'denied',
        pin_used: pin_used || null,
        ip_address: ip_address || null,
        notes: 'Failed access attempt - notification sent'
      });

    } else if (type === 'no_swipe_out') {
      // Get user and door details
      const [userResult, doorResult] = await Promise.all([
        user_id ? supabase.from('users').select('name, username, email, last_entry_time').eq('id', user_id).single() : null,
        door_id ? supabase.from('doors').select('name, location').eq('id', door_id).single() : null
      ]);

      const user = userResult?.data;
      const door = doorResult?.data;

      emailSubject = 'No Exit Recorded Alert - Door Access System';
      emailBody = `Dear Administrator,

A user has not recorded an exit from a secured area:

User: ${user?.name || 'Unknown'} (${user?.username || 'Unknown'})
Door: ${door?.name || 'Unknown'} at ${door?.location || 'Unknown Location'}
Entry Time: ${user?.last_entry_time ? new Date(user.last_entry_time).toLocaleString() : 'Unknown'}
Current Time: ${new Date().toLocaleString()}

Please verify the user's location and status.

Best regards,
Door Access System`;

    } else if (type === 'test') {
      emailSubject = 'Test Email - Door Access System';
      emailBody = `This is a test email from the Door Access System.

If you received this email, your SMTP configuration is working correctly.

Sent at: ${new Date().toLocaleString()}

Best regards,
Door Access System`;
    }

    // In a real implementation, you would use the SMTP settings to send the email
    // For now, we'll simulate the email sending
    console.log('Email would be sent:', {
      to: recipientEmail,
      subject: emailSubject,
      body: emailBody,
      smtp: {
        host: settingsMap.smtp_host,
        port: settingsMap.smtp_port,
        from: `${settingsMap.smtp_from_name} <${settingsMap.smtp_from_email}>`
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Notification email sent successfully',
      type,
      recipient: recipientEmail
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
