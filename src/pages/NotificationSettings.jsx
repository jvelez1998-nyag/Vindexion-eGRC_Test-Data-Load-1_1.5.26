import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import NotificationPreferencesPanel from "@/components/notifications/NotificationPreferencesPanel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, Settings, Mail, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NotificationSettings() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => setUserEmail(user?.email)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1623] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
                <Bell className="h-7 w-7 text-white" />
              </div>
              Notification Settings
            </h1>
            <p className="text-slate-400 mt-2">
              Configure your notification preferences and email digest settings
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/20">
                  <Zap className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Real-Time Alerts</h3>
                  <p className="text-xs text-slate-400">Critical events monitored 24/7</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Bell className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">In-App Notifications</h3>
                  <p className="text-xs text-slate-400">Instant updates in platform</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <Mail className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Email Digests</h3>
                  <p className="text-xs text-slate-400">Daily or weekly summaries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What Gets Monitored */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-400" />
              Automated Event Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Badge className="bg-rose-500/20 text-rose-400 text-[10px]">Critical</Badge>
                  Real-Time Alerts
                </h4>
                <ul className="text-xs text-slate-400 space-y-1 ml-4">
                  <li>• High-priority risks (score ≥ 16/25)</li>
                  <li>• Critical and high severity incidents</li>
                  <li>• Non-compliant items</li>
                  <li>• Failed control tests</li>
                  <li>• Critical vendor risk changes</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">Scheduled</Badge>
                  Proactive Reminders
                </h4>
                <ul className="text-xs text-slate-400 space-y-1 ml-4">
                  <li>• Upcoming audits and assessments</li>
                  <li>• Risk review deadlines</li>
                  <li>• Control implementation due dates</li>
                  <li>• Vendor contract expirations</li>
                  <li>• Periodic review requirements</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">Insights</Badge>
                  AI-Powered Notifications
                </h4>
                <ul className="text-xs text-slate-400 space-y-1 ml-4">
                  <li>• AI-generated insights and analysis</li>
                  <li>• Predictive risk recommendations</li>
                  <li>• Compliance gap detection</li>
                  <li>• Pattern recognition alerts</li>
                  <li>• Anomaly detection</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Updates</Badge>
                  System Notifications
                </h4>
                <ul className="text-xs text-slate-400 space-y-1 ml-4">
                  <li>• Framework compliance changes</li>
                  <li>• Import/export operation results</li>
                  <li>• Guidance library updates</li>
                  <li>• Workflow status changes</li>
                  <li>• User assignment notifications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Panel */}
        {userEmail && <NotificationPreferencesPanel userEmail={userEmail} />}
      </div>
    </div>
  );
}