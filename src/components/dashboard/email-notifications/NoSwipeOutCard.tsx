
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  settings: Record<string, string>;
  setSettings: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  updateSetting: (key: string, value: string) => void;
}

const NoSwipeOutCard = ({ settings, setSettings, updateSetting }: Props) => (
  <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Clock className="w-5 h-5" />
        <span>No Swipe Out Alerts</span>
      </CardTitle>
      <CardDescription>
        Notifications for users who don't swipe out of secured areas
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Alert Triggers:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • User enters but doesn't exit within configured time
            {" "}
            <span className="font-medium text-blue-900">(currently: {settings.no_swipe_out_threshold_hours || 2} hours)</span>
          </li>
          <li>• Building security hours end with users still inside</li>
          <li>• Emergency evacuation protocols activated</li>
        </ul>
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label htmlFor="no_swipe_out_threshold_hours">
            Threshold (hours before alert):
          </Label>
          <Input
            id="no_swipe_out_threshold_hours"
            type="number"
            min={1}
            step={1}
            className="w-32"
            value={settings.no_swipe_out_threshold_hours || ''}
            onChange={e =>
              setSettings(prev => ({
                ...prev,
                no_swipe_out_threshold_hours: e.target.value.replace(/[^0-9]/g, ''),
              }))
            }
            onBlur={e => {
              const val = e.target.value.trim() || '2';
              if (val !== settings.no_swipe_out_threshold_hours) {
                updateSetting("no_swipe_out_threshold_hours", val);
              }
            }}
            placeholder="2"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              updateSetting("no_swipe_out_threshold_hours", settings.no_swipe_out_threshold_hours || '2');
            }}
            className="ml-2"
          >
            Save
          </Button>
        </div>
      </div>

      <div>
        <Label>Email Template Preview</Label>
        <Textarea
          value={`Subject: No Exit Recorded Alert - Door Access System

Dear Administrator,

A user has not recorded an exit from a secured area:

User: [USER_NAME] ([USERNAME])
Door: [DOOR_NAME] at [LOCATION]
Entry Time: [ENTRY_TIMESTAMP]
Current Time: [CURRENT_TIMESTAMP]
Duration: [DURATION] (Threshold: ${settings.no_swipe_out_threshold_hours || 2} hours)

Please verify the user's location and status.

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

export default NoSwipeOutCard;
