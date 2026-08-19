import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, RefreshCw, Bell, FileText, CheckCircle2, Activity, Clock, Target } from "lucide-react";

export default function CrossWalkAutomation() {
  const [automations, setAutomations] = useState({
    auto_mapping_update: true,
    gap_detection: true,
    compliance_sync: false,
    control_alignment: true,
    requirement_tracking: true,
    coverage_monitoring: true,
    change_alerts: false,
    periodic_review: true
  });

  const workflows = [
    {
      id: 'auto_mapping_update',
      title: 'Auto Mapping Updates',
      description: 'Automatically update mappings when frameworks change',
      icon: RefreshCw,
      color: 'violet',
      benefit: 'Stay current'
    },
    {
      id: 'gap_detection',
      title: 'Automated Gap Detection',
      description: 'Continuously scan for coverage gaps and missing mappings',
      icon: Target,
      color: 'amber',
      benefit: 'Proactive identification'
    },
    {
      id: 'compliance_sync',
      title: 'Compliance Synchronization',
      description: 'Sync compliance status across mapped frameworks',
      icon: CheckCircle2,
      color: 'emerald',
      benefit: 'Unified view'
    },
    {
      id: 'control_alignment',
      title: 'Control Alignment',
      description: 'Auto-align controls to mapped framework requirements',
      icon: Activity,
      color: 'blue',
      benefit: 'Automated compliance'
    },
    {
      id: 'requirement_tracking',
      title: 'Requirement Tracking',
      description: 'Track requirement changes across all frameworks',
      icon: FileText,
      color: 'indigo',
      benefit: 'Change awareness'
    },
    {
      id: 'coverage_monitoring',
      title: 'Coverage Monitoring',
      description: 'Monitor framework coverage percentages and trends',
      icon: Activity,
      color: 'cyan',
      benefit: 'Visibility'
    },
    {
      id: 'change_alerts',
      title: 'Framework Change Alerts',
      description: 'Alert when mapped frameworks are updated',
      icon: Bell,
      color: 'rose',
      benefit: 'Stay informed'
    },
    {
      id: 'periodic_review',
      title: 'Periodic Review Automation',
      description: 'Auto-schedule mapping reviews and validations',
      icon: Clock,
      color: 'purple',
      benefit: 'Continuous validation'
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
    violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    emerald: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20',
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    indigo: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20',
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20',
    rose: 'from-rose-500/10 to-red-500/10 border-rose-500/20',
    purple: 'from-purple-500/10 to-violet-500/10 border-purple-500/20'
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{activeCount}</div>
                <div className="text-sm text-slate-400">Active Rules</div>
              </div>
              <Zap className="h-8 w-8 text-violet-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">Auto</div>
                <div className="text-sm text-slate-400">Sync Enabled</div>
              </div>
              <RefreshCw className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">~15h</div>
                <div className="text-sm text-slate-400">Saved/Month</div>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Rules */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg">Automation Rules</CardTitle>
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

      {/* Benefits */}
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
                  <p className="text-sm text-white font-medium">Continuous Alignment</p>
                  <p className="text-xs text-slate-400">Mappings stay up-to-date automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Reduced Manual Effort</p>
                  <p className="text-xs text-slate-400">Automated updates and synchronization</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Early Gap Detection</p>
                  <p className="text-xs text-slate-400">Identify coverage issues proactively</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Compliance Confidence</p>
                  <p className="text-xs text-slate-400">Ensure comprehensive framework coverage</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}