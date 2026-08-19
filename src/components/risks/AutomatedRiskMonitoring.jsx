import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, Clock, Bell, TrendingUp, AlertTriangle, Shield, CheckCircle2, Activity } from "lucide-react";

export default function AutomatedRiskMonitoring() {
  const [automations, setAutomations] = useState({
    auto_risk_scoring: true,
    continuous_monitoring: true,
    threshold_alerts: true,
    treatment_tracking: false,
    periodic_reassessment: true,
    escalation_rules: true,
    risk_aggregation: false,
    trend_detection: true
  });

  const workflows = [
    {
      id: 'auto_risk_scoring',
      title: 'Automatic Risk Scoring',
      description: 'Auto-calculate risk scores when likelihood or impact changes',
      icon: Activity,
      color: 'indigo',
      benefit: 'Real-time risk prioritization'
    },
    {
      id: 'continuous_monitoring',
      title: 'Continuous Risk Monitoring',
      description: 'Monitor risk indicators and trigger updates automatically',
      icon: TrendingUp,
      color: 'violet',
      benefit: 'Early warning system'
    },
    {
      id: 'threshold_alerts',
      title: 'Risk Threshold Alerts',
      description: 'Alert stakeholders when risks exceed defined thresholds',
      icon: Bell,
      color: 'rose',
      benefit: 'Immediate awareness'
    },
    {
      id: 'treatment_tracking',
      title: 'Treatment Progress Tracking',
      description: 'Track mitigation action completion and effectiveness',
      icon: CheckCircle2,
      color: 'emerald',
      benefit: 'Accountability'
    },
    {
      id: 'periodic_reassessment',
      title: 'Periodic Reassessment',
      description: 'Automatically schedule risk reassessments based on criticality',
      icon: Clock,
      color: 'amber',
      benefit: 'Up-to-date risk data'
    },
    {
      id: 'escalation_rules',
      title: 'Escalation Rules',
      description: 'Auto-escalate high-priority or overdue risks to management',
      icon: AlertTriangle,
      color: 'orange',
      benefit: 'Management visibility'
    },
    {
      id: 'risk_aggregation',
      title: 'Risk Aggregation',
      description: 'Aggregate related risks for portfolio-level insights',
      icon: Shield,
      color: 'blue',
      benefit: 'Holistic view'
    },
    {
      id: 'trend_detection',
      title: 'AI Trend Detection',
      description: 'Use AI to detect emerging risk patterns and correlations',
      icon: Zap,
      color: 'cyan',
      benefit: 'Predictive insights'
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
    orange: 'from-orange-500/10 to-amber-500/10 border-orange-500/20',
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20'
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
                <div className="text-3xl font-bold text-white mb-1">~15h</div>
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
          <CardTitle className="text-lg">Monitoring & Automation Rules</CardTitle>
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
                  <p className="text-sm text-white font-medium">Proactive Risk Management</p>
                  <p className="text-xs text-slate-400">Identify and respond to risks before they escalate</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Reduced Manual Effort</p>
                  <p className="text-xs text-slate-400">Automate repetitive monitoring and reporting tasks</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Enhanced Visibility</p>
                  <p className="text-xs text-slate-400">Real-time dashboards and automatic alerts</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Better Decision Making</p>
                  <p className="text-xs text-slate-400">AI-powered insights for informed risk responses</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}