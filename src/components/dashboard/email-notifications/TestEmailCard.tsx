
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  settings: Record<string, string>;
  sendTestEmail: () => void;
}

const TestEmailCard = ({ settings, sendTestEmail }: Props) => (
  <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
    <CardHeader>
      <CardTitle>Test Email Configuration</CardTitle>
      <CardDescription>
        Send a test email to verify your SMTP settings
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Label htmlFor="test_email">Test Email Address</Label>
          <Input
            id="test_email"
            type="email"
            placeholder="admin@company.com"
            defaultValue={settings.smtp_from_email}
          />
        </div>
        <Button onClick={sendTestEmail} className="mt-6">
          Send Test Email
        </Button>
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Make sure your SMTP settings are configured in the System Settings 
          before sending test emails. The test will use your current SMTP configuration.
        </p>
      </div>
    </CardContent>
  </Card>
);

export default TestEmailCard;
