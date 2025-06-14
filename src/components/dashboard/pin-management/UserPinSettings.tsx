
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key } from 'lucide-react';

interface UserPinSettingsProps {
  onUpdatePin: (newPin: string) => Promise<void>;
  loading?: boolean;
  isDisabled?: boolean;
}

const UserPinSettings = ({ onUpdatePin, loading, isDisabled }: UserPinSettingsProps) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewPin(pin);
    setConfirmPin(pin);
  };

  const handleUpdate = async () => {
    if (!newPin || !confirmPin) return;
    if (newPin !== confirmPin) return;
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) return;
    await onUpdatePin(newPin);
    setNewPin('');
    setConfirmPin('');
  };

  if (isDisabled) {
    return (
      <Card className="bg-white/60 max-w-md mx-auto border-2 border-dashed border-red-300 text-center mt-16">
        <CardHeader>
          <CardTitle>PIN is Disabled</CardTitle>
          <CardDescription>
            Please contact an administrator to enable your PIN for access.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-gray-700">
          You cannot change or use your PIN until it is enabled.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Change Your PIN</h2>
        <p className="text-gray-600">Update your 4-digit access PIN</p>
      </div>
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>PIN Settings</span>
          </CardTitle>
          <CardDescription>
            Enter your new 4-digit PIN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newPin">New PIN</Label>
            <div className="flex space-x-2">
              <Input
                id="newPin"
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
                placeholder="••••"
              />
              <Button type="button" onClick={generateRandomPin} variant="outline">
                Generate
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPin">Confirm New PIN</Label>
            <Input
              id="confirmPin"
              type="password"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.slice(0, 4))}
              placeholder="••••"
            />
          </div>
          <Button onClick={handleUpdate} className="w-full" disabled={loading}>
            Update PIN
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPinSettings;
