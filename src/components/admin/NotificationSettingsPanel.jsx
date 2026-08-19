import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

export default function NotificationSettingsPanel() {
  const notificationTypes = [
    { id: 'risk', label: 'Risk Alerts', description: 'High-priority risk notifications' },
    { id: 'compliance', label: 'Compliance Updates', description: 'Compliance status changes' },
    { id: 'audit', label: 'Audit Notifications', description: 'Audit milestones and findings' },
    { id: 'control', label: 'Control Tests', description: 'Control testing reminders' },
    { id: 'incident', label: 'Incident Alerts', description: 'Critical incident notifications' },
    { id: 'vendor', label: 'Vendor Reviews', description: 'Vendor assessment reminders' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-400" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div>
                  <h4 className="font-semibold text-white">{type.label}</h4>
                  <p className="text-sm text-slate-400">{type.description}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}