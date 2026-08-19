import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";

export default function AutomatedComplianceWorkflow() {
  const [workflows, setWorkflows] = useState({
    autoReview: true,
    gapDetection: true,
    controlMapping: true,
    riskAssessment: false,
    evidenceCollection: true,
    reportGeneration: false,
    complianceScoring: true,
    alerting: true
  });

  const workflowConfig = [
    {
      id: 'autoReview',
      title: 'Automated Review Scheduling',
      description: 'Automatically schedule compliance reviews based on due dates and priorities',
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      benefit: 'Saves 15+ hours/month'
    },
    {
      id: 'gapDetection',
      title: 'AI Gap Detection',
      description: 'Continuously monitor for compliance gaps and missing requirements',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
      benefit: 'Real-time alerts'
    },
    {
      id: 'controlMapping',
      title: 'Smart Control Mapping',
      description: 'Automatically map controls to compliance requirements using AI',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-500',
      benefit: '90% accuracy'
    },
    {
      id: 'riskAssessment',
      title: 'Compliance Risk Scoring',
      description: 'Auto-calculate risk scores for non-compliant items',
      icon: TrendingUp,
      color: 'from-rose-500 to-red-500',
      benefit: 'Predictive insights'
    },
    {
      id: 'evidenceCollection',
      title: 'Evidence Collection',
      description: 'Automated evidence gathering and documentation',
      icon: CheckCircle2,
      color: 'from-violet-500 to-purple-500',
      benefit: 'Audit-ready'
    },
    {
      id: 'reportGeneration',
      title: 'Automated Reporting',
      description: 'Generate compliance status reports on schedule',
      icon: Zap,
      color: 'from-indigo-500 to-blue-500',
      benefit: 'Weekly reports'
    },
    {
      id: 'complianceScoring',
      title: 'Compliance Scoring Engine',
      description: 'Calculate and track overall compliance health scores',
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-500',
      benefit: 'Health metrics'
    },
    {
      id: 'alerting',
      title: 'Smart Alerting',
      description: 'Intelligent notifications for compliance deadlines and issues',
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
      benefit: 'Never miss deadlines'
    }
  ];

  const toggleWorkflow = (id) => {
    setWorkflows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCount = Object.values(workflows).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5 text-indigo-400" />
              <span className="text-sm text-slate-400">Active Workflows</span>
            </div>
            <div className="text-3xl font-bold text-white">{activeCount}</div>
            <p className="text-xs text-indigo-400 mt-1">of {workflowConfig.length} available</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-slate-400">Automation Rate</span>
            </div>
            <div className="text-3xl font-bold text-white">{Math.round((activeCount / workflowConfig.length) * 100)}%</div>
            <p className="text-xs text-emerald-400 mt-1">Compliance automated</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-violet-400" />
              <span className="text-sm text-slate-400">Time Saved</span>
            </div>
            <div className="text-3xl font-bold text-white">{activeCount * 15}h</div>
            <p className="text-xs text-violet-400 mt-1">Per month estimate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Automation Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {workflowConfig.map(workflow => {
              const Icon = workflow.icon;
              const isActive = workflows[workflow.id];
              
              return (
                <div 
                  key={workflow.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20' 
                      : 'bg-[#151d2e] border-[#2a3548]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${workflow.color}/20`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-white">{workflow.title}</h4>
                          <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                            {workflow.benefit}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">{workflow.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => toggleWorkflow(workflow.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}