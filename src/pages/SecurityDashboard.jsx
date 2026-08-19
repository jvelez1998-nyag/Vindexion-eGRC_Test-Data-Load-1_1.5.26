import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Activity, AlertTriangle, Lock, Eye, FileText, Users, TrendingUp } from "lucide-react";
import SecurityMonitoring from "@/components/security/SecurityMonitoring";
import { useSecurity } from "@/components/security/SecurityProvider";
import { format } from "date-fns";

export default function SecurityDashboard() {
  const { securityScore, sessionInfo } = useSecurity();

  const { data: securityEvents = [] } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => base44.entities.SecurityEvent.list('-created_date', 100),
    staleTime: 30000
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
    staleTime: 30000
  });

  const criticalEvents = securityEvents.filter(e => e.severity === 'critical');
  const unresolvedEvents = securityEvents.filter(e => !e.resolved);
  const recentLogins = auditLogs.filter(log => log.action === 'login');

  return (
    <div className="min-h-screen bg-[#0f1623] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
            <Shield className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Security Command Center</h1>
            <p className="text-slate-400 text-sm">Real-time security monitoring and threat detection</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Security Score</p>
                  <p className="text-2xl font-bold text-white">{securityScore || 85}</p>
                </div>
                <Shield className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Critical Events</p>
                  <p className="text-2xl font-bold text-rose-400">{criticalEvents.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-rose-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Unresolved</p>
                  <p className="text-2xl font-bold text-amber-400">{unresolvedEvents.length}</p>
                </div>
                <Eye className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Audit Logs</p>
                  <p className="text-2xl font-bold text-blue-400">{auditLogs.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-Time Monitoring */}
        <SecurityMonitoring />

        {/* Detailed Logs */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="session">Session Info</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {securityEvents.map((event, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              event.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                              event.severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                              event.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {event.severity}
                            </Badge>
                            <Badge variant="outline">{event.event_type}</Badge>
                          </div>
                          <span className="text-xs text-slate-500">
                            {format(new Date(event.created_date), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">User:</span>
                            <span className="text-white ml-2">{event.user_email}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">IP:</span>
                            <span className="text-white ml-2">{event.ip_address}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {auditLogs.map((log, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-indigo-500/20 text-indigo-400">{log.action}</Badge>
                            <span className="text-xs text-slate-400">{log.entity_type}</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {format(new Date(log.created_date), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">
                          <span className="text-slate-400">By:</span> {log.user_email}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="session">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Current Session Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400">Session ID:</span>
                      <div className="text-white font-mono text-xs mt-1">{sessionInfo?.id || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">IP Address:</span>
                      <div className="text-white font-mono text-xs mt-1">{sessionInfo?.ipAddress || 'Detecting...'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Location:</span>
                      <div className="text-white text-xs mt-1">{sessionInfo?.location || 'Detecting...'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Started:</span>
                      <div className="text-white text-xs mt-1">
                        {sessionInfo?.startTime ? format(new Date(sessionInfo.startTime), 'MMM d, h:mm a') : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}