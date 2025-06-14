
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const FailedAccessCard = () => (
  <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <AlertTriangle className="w-5 h-5" />
        <span>Failed Access Alerts</span>
      </CardTitle>
      <CardDescription>
        Notifications sent when incorrect PINs are used
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h4 className="font-medium text-orange-800 mb-2">Alert Triggers:</h4>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Incorrect PIN entered</li>
          <li>• Unauthorized access attempts</li>
          <li>• Multiple failed attempts from same user</li>
          <li>• Access denied due to expired permissions</li>
        </ul>
      </div>
      <div>
        <Label>Email Template Preview</Label>
        <Textarea
          value={`Subject: Access Denied Alert - Door Access System

Dear Administrator,

An unauthorized access attempt was detected:

Door: [DOOR_NAME] at [LOCATION]
Time: [TIMESTAMP]
PIN Used: [PIN_USED]
IP Address: [IP_ADDRESS]

Please review the access logs for more details.

Best regards,
Door Access System`}
          rows={10}
          readOnly
          className="bg-gray-50"
        />
      </div>
    </CardContent>
  </Card>
);

export default FailedAccessCard;
