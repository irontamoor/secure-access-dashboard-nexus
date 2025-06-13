
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Key, User } from 'lucide-react';

interface PinManagementProps {
  isAdmin: boolean;
  userId?: string;
}

interface UserPin {
  id: string;
  name: string;
  pin: string;
  lastChanged: string;
}

const PinManagement = ({ isAdmin, userId }: PinManagementProps) => {
  const { toast } = useToast();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const [allUserPins, setAllUserPins] = useState<UserPin[]>([
    { id: '1', name: 'Administrator', pin: '1234', lastChanged: '2024-01-10' },
    { id: '2', name: 'John Doe', pin: '5678', lastChanged: '2024-01-12' },
    { id: '3', name: 'Jane Smith', pin: '9876', lastChanged: '2024-01-08' },
  ]);

  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewPin(pin);
    setConfirmPin(pin);
  };

  const updateOwnPin = () => {
    if (!currentPin || !newPin || !confirmPin) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "Error",
        description: "New PIN and confirmation don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({
        title: "Error",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "PIN Updated",
      description: "Your PIN has been successfully changed",
    });

    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const resetUserPin = (userId: string, userName: string) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    setAllUserPins(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, pin: newPin, lastChanged: new Date().toISOString().split('T')[0] }
        : user
    ));
    
    toast({
      title: "PIN Reset",
      description: `New PIN for ${userName}: ${newPin}`,
    });
  };

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PIN Management</h2>
          <p className="text-gray-600">Manage user PINs and access codes</p>
        </div>

        <div className="grid gap-4">
          {allUserPins.map((user) => (
            <Card key={user.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-gray-600">Current PIN: ••••</p>
                      <p className="text-sm text-gray-500">Last changed: {user.lastChanged}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => resetUserPin(user.id, user.name)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Key className="w-4 h-4" />
                    <span>Reset PIN</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
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
            Enter your current PIN and choose a new one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPin">Current PIN</Label>
            <Input
              id="currentPin"
              type="password"
              maxLength={4}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.slice(0, 4))}
              placeholder="••••"
            />
          </div>
          
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
          
          <Button onClick={updateOwnPin} className="w-full">
            Update PIN
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PinManagement;
