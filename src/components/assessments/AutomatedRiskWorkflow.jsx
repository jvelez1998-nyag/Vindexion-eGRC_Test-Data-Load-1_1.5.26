import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Zap, Clock, CheckCircle2, AlertTriangle, Bell, Mail, Calendar } from "lucide-react";

export default function AutomatedRiskWorkflow() {
  const [automations, setAutomations] = useState({
    auto_review_scheduling: true,
    critical_risk_alerts: true,
    treatment_reminders: true,
    quarterly_reassessment: false,
    control_effectiveness_monitoring: true,
    risk_reporting: false,
    escalation_workflows: true,
    ai_anomaly_detection: false
  });

  const workflows = [
    {
      id: 'auto_review_scheduling',
      title: 'Automatic Review Scheduling',
      description: 'Automatically schedule risk reviews based on criticality and last review date',
      icon: Calendar,
      color: 'blue',
      estimatedTime: '2 hours/month'
    },
    {
      id: 'critical_risk_alerts',
      title: 'Critical Risk Alerts',
      description: 'Instant notifications when risks exceed critical thresholds',
      icon: AlertTriangle,
      color: 'rose',
      estimatedTime: '1 hour/month'
    },
    {
      id: 'treatment_reminders',
      title: 'Treatment Plan Reminders',
      description: 'Remind risk owners of pending treatment actions and deadlines',
      icon: Clock,
      color: 'amber',
      estimatedTime: '3 hours/month'
    },
    {
      id: 'quarterly_reassessment',
      title: 'Quarterly Reassessment',
      description: 'Automatically trigger reassessments for high-risk items quarterly',
      icon: CheckCircle2,
      color: 'emerald',
      estimatedTime: '4 hours/quarter'
    },
    {
      id: 'control_effectiveness_monitoring',
      title: 'Control Effectiveness Monitoring',
      description: 'Track control performance and flag degradation automatically',
      icon: Zap,
      color: 'violet',
      estimatedTime: '2 hours/month'
    },
    {
      id: 'risk_reporting',
      title: 'Automated Risk Reporting',
      description: 'Generate and distribute risk reports to stakeholders',
      icon: Mail,
      color: 'cyan',
      estimatedTime: '5 hours/month'
    },
    {
      id: 'escalation_workflows',
      title: 'Escalation Workflows',
      description: 'Auto-escalate overdue or unaddressed critical risks to management',
      icon: Bell,
      color: 'orange',
      estimatedTime: '1 hour/month'
    },
    {
      id: 'ai_anomaly_detection',
      title: 'AI Anomaly Detection',
      description: 'Use AI to detect unusual risk patterns and emerging threats',
      icon: Zap,
      color: 'indigo',
      estimatedTime: '6 hours/month'
    }
  ];

  const toggleAutomation = (id) => {
    setAutomations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const activeCount = Object.values(automations).filter(Boolean).length;
  const totalTime = workflows
    .filter(w => automations[w.id])
    .reduce((sum, w) => {
      const match = w.estimatedTime.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

  const colorClasses = {
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    rose: 'from-rose-500/10 to-red-500/10 border-rose-500/20',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    emerald: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20',
    violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20',
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20',
    orange: 'from-orange-500/10 to-amber-500/10 border-orange-500/20',
    indigo: 'from-indigo-500/10 to-violet-500/10 border-indigo-500/20'
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
                <div className="text-sm text-slate-400">Active Automations</div>
              </div>
              <Zap className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{totalTime}h</div>
                <div className="text-sm text-slate-400">Time Saved/Month</div>
              </div>
              <Clock className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">~{workflows.length * 10}</div>
                <div className="text-sm text-slate-400">Tasks Automated</div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg">Configure Automation Rules</CardTitle>
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
                            Saves approximately: {workflow.estimatedTime}
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

      {/* Insights */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Automation Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium">Consistent Risk Management</p>
                <p className="text-xs text-slate-400">Ensures no risks fall through the cracks with automated scheduling</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium">Faster Response Times</p>
                <p className="text-xs text-slate-400">Instant alerts enable immediate action on critical risks</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium">Reduced Manual Effort</p>
                <p className="text-xs text-slate-400">Save {totalTime}+ hours per month on routine risk management tasks</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium">Better Compliance</p>
                <p className="text-xs text-slate-400">Automated documentation and reporting for audit readiness</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}