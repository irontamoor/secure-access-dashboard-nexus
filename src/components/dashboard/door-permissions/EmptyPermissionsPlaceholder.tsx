
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function EmptyPermissionsPlaceholder() {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-8 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Permissions Set</h3>
        <p className="text-gray-600">Get started by granting door access to users</p>
      </CardContent>
    </Card>
  );
}
