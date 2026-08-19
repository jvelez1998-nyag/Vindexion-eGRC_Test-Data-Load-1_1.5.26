import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, Clock, Bell, AlertTriangle, Shield, CheckCircle2, Activity, TrendingUp } from "lucide-react";

export default function IncidentAutomation() {
  const [automations, setAutomations] = useState({
    auto_classification: true,
    severity_escalation: true,
    stakeholder_notification: true,
    sla_monitoring: false,
    response_tracking: true,
    post_incident_review: true,
    pattern_detection: false,
    predictive_alerts: true
  });

  const workflows = [
    {
      id: 'auto_classification',
      title: 'Auto Incident Classification',
      description: 'Automatically classify incidents by type and severity using AI',
      icon: Activity,
      color: 'indigo',
      benefit: 'Faster triage'
    },
    {
      id: 'severity_escalation',
      title: 'Severity-Based Escalation',
      description: 'Auto-escalate critical incidents to senior management',
      icon: AlertTriangle,
      color: 'rose',
      benefit: 'Immediate awareness'
    },
    {
      id: 'stakeholder_notification',
      title: 'Stakeholder Notifications',
      description: 'Automatically notify relevant stakeholders based on incident type',
      icon: Bell,
      color: 'violet',
      benefit: 'Better communication'
    },
    {
      id: 'sla_monitoring',
      title: 'SLA Monitoring',
      description: 'Track response and resolution times against defined SLAs',
      icon: Clock,
      color: 'amber',
      benefit: 'Meet commitments'
    },
    {
      id: 'response_tracking',
      title: 'Response Progress Tracking',
      description: 'Monitor incident response progress and completion',
      icon: TrendingUp,
      color: 'emerald',
      benefit: 'Accountability'
    },
    {
      id: 'post_incident_review',
      title: 'Post-Incident Review Automation',
      description: 'Auto-schedule and track post-incident reviews',
      icon: CheckCircle2,
      color: 'blue',
      benefit: 'Continuous improvement'
    },
    {
      id: 'pattern_detection',
      title: 'AI Pattern Detection',
      description: 'Detect recurring incident patterns and root causes',
      icon: Zap,
      color: 'cyan',
      benefit: 'Proactive prevention'
    },
    {
      id: 'predictive_alerts',
      title: 'Predictive Incident Alerts',
      description: 'Use AI to predict and alert on potential incidents',
      icon: Shield,
      color: 'purple',
      benefit: 'Prevention'
    }
  ];

  const toggleAutomation = (id) => {
    setAutomations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const activeCount = Object.values(automations).filter(Boolean).length;

  const colorClasses = {
    indigo: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20',
    violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20',
    rose: 'from-rose-500/10 to-red-500/10 border-rose-500/20',
    emerald: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20',
    purple: 'from-purple-500/10 to-violet-500/10 border-purple-500/20'
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{activeCount}</div>
                <div className="text-sm text-slate-400">Active Rules</div>
              </div>
              <Zap className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-slate-400">Monitoring</div>
              </div>
              <Activity className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">~25h</div>
                <div className="text-sm text-slate-400">Saved/Month</div>
              </div>
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Rules */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg">Incident Automation Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {workflows.map(workflow => {
              const Icon = workflow.icon;
              const isActive = automations[workflow.id];
              
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
                          onCheckedChange={() => toggleAutomation(workflow.id)}
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

      {/* Benefits Summary */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Automation Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Faster Response Times</p>
                  <p className="text-xs text-slate-400">Automated triage and routing reduces delays</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Consistent Process</p>
                  <p className="text-xs text-slate-400">Standardized incident handling procedures</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Better Insights</p>
                  <p className="text-xs text-slate-400">AI-powered pattern detection and analytics</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Proactive Prevention</p>
                  <p className="text-xs text-slate-400">Predict and prevent incidents before they occur</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}