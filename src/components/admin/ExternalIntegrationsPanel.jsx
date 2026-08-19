import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, CheckCircle2, XCircle, Settings } from "lucide-react";

export default function ExternalIntegrationsPanel() {
  const integrations = [
    { name: 'Slack', status: 'connected', icon: '💬', description: 'Real-time notifications' },
    { name: 'Microsoft Teams', status: 'disconnected', icon: '👥', description: 'Team collaboration' },
    { name: 'JIRA', status: 'connected', icon: '📋', description: 'Issue tracking' },
    { name: 'ServiceNow', status: 'connected', icon: '🎫', description: 'Service management' },
    { name: 'Splunk', status: 'disconnected', icon: '📊', description: 'Log analysis' },
    { name: 'AWS Security Hub', status: 'connected', icon: '☁️', description: 'Cloud security' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-cyan-400" />
            External Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration, idx) => (
              <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <h4 className="font-semibold text-white">{integration.name}</h4>
                        <p className="text-xs text-slate-400">{integration.description}</p>
                      </div>
                    </div>
                    {integration.status === 'connected' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={integration.status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}>
                      {integration.status}
                    </Badge>
                    <Button size="sm" variant="outline" className="border-[#2a3548]">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}