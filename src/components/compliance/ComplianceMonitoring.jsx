import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Eye, Bell, RefreshCw, CheckCircle2, AlertTriangle, Clock, Activity, FileText, Zap } from "lucide-react";

export default function ComplianceMonitoring() {
  const [monitoring, setMonitoring] = useState({
    status_changes: true,
    due_date_alerts: true,
    framework_updates: false,
    evidence_expiry: true,
    audit_prep: true,
    gap_detection: true,
    control_alignment: false,
    periodic_review: true
  });

  const workflows = [
    {
      id: 'status_changes',
      title: 'Status Change Tracking',
      description: 'Monitor compliance status changes and progress',
      icon: Activity,
      color: 'emerald',
      benefit: 'Real-time visibility'
    },
    {
      id: 'due_date_alerts',
      title: 'Due Date Alerts',
      description: 'Alert on upcoming compliance deadlines',
      icon: Clock,
      color: 'amber',
      benefit: 'Never miss deadlines'
    },
    {
      id: 'framework_updates',
      title: 'Framework Updates',
      description: 'Track regulatory framework changes and updates',
      icon: RefreshCw,
      color: 'cyan',
      benefit: 'Stay current'
    },
    {
      id: 'evidence_expiry',
      title: 'Evidence Expiry Monitoring',
      description: 'Alert when compliance evidence is expiring',
      icon: FileText,
      color: 'rose',
      benefit: 'Maintain compliance'
    },
    {
      id: 'audit_prep',
      title: 'Audit Readiness',
      description: 'Auto-prepare compliance documentation for audits',
      icon: CheckCircle2,
      color: 'blue',
      benefit: 'Audit-ready'
    },
    {
      id: 'gap_detection',
      title: 'Gap Detection',
      description: 'Automatically identify compliance gaps',
      icon: AlertTriangle,
      color: 'orange',
      benefit: 'Proactive management'
    },
    {
      id: 'control_alignment',
      title: 'Control Alignment',
      description: 'Ensure controls map to compliance requirements',
      icon: Activity,
      color: 'violet',
      benefit: 'Complete coverage'
    },
    {
      id: 'periodic_review',
      title: 'Periodic Review Automation',
      description: 'Schedule automatic compliance reviews',
      icon: Bell,
      color: 'indigo',
      benefit: 'Continuous validation'
    }
  ];

  const toggleMonitoring = (id) => {
    setMonitoring(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const activeCount = Object.values(monitoring).filter(Boolean).length;

  const colorClasses = {
    emerald: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20',
    rose: 'from-rose-500/10 to-red-500/10 border-rose-500/20',
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    orange: 'from-orange-500/10 to-amber-500/10 border-orange-500/20',
    violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20',
    indigo: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20'
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{activeCount}</div>
                <div className="text-sm text-slate-400">Active Monitors</div>
              </div>
              <Eye className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-slate-400">Monitoring</div>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">~12h</div>
                <div className="text-sm text-slate-400">Saved/Month</div>
              </div>
              <Zap className="h-8 w-8 text-violet-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Rules */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg">Monitoring Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {workflows.map(workflow => {
              const Icon = workflow.icon;
              const isActive = monitoring[workflow.id];
              
              return (
                <Card key={workflow.id} className={`bg-gradient-to-br ${colorClasses[workflow.color]} transition-all`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg bg-${workflow.color}-500/10 border border-${workflow.color}-500/20`}>
                          <Icon className={`h-5 w-5 text-${workflow.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-white">{workflow.title}</h4>
                            <Badge className={isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400'}>
                              {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">{workflow.description}</p>
                          <div className="text-xs text-slate-500">
                            Benefit: {workflow.benefit}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => toggleMonitoring(workflow.id)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Monitoring Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Proactive Management</p>
                  <p className="text-xs text-slate-400">Identify issues before they become problems</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Automated Alerts</p>
                  <p className="text-xs text-slate-400">Never miss critical compliance deadlines</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Audit Confidence</p>
                  <p className="text-xs text-slate-400">Always audit-ready with continuous validation</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Reduced Manual Work</p>
                  <p className="text-xs text-slate-400">Automated tracking and reporting</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}