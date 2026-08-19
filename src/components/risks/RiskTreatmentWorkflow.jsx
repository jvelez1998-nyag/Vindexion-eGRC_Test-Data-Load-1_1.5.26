import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, Shield, AlertTriangle, TrendingDown, CheckCircle2, Target, Clock, Brain, FileText, TrendingUp } from "lucide-react";

export default function RiskTreatmentWorkflow() {
  const [workflows, setWorkflows] = useState({
    autoAssessment: true,
    controlMapping: true,
    mitigationTracking: false,
    residualCalc: true,
    reviewScheduling: true,
    escalationAlerts: true,
    trendAnalysis: false,
    reportGeneration: true
  });

  const workflowConfig = [
    {
      id: 'autoAssessment',
      title: 'Automated Risk Assessment',
      description: 'AI-powered initial risk scoring based on threat intelligence',
      icon: Brain,
      color: 'from-indigo-500 to-purple-500',
      benefit: 'Save 10+ hours/week'
    },
    {
      id: 'controlMapping',
      title: 'Smart Control Mapping',
      description: 'Automatically map controls to risks based on category and impact',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      benefit: 'Real-time mapping'
    },
    {
      id: 'mitigationTracking',
      title: 'Mitigation Progress Tracking',
      description: 'Monitor mitigation action completion and effectiveness',
      icon: Target,
      color: 'from-emerald-500 to-teal-500',
      benefit: 'Track progress'
    },
    {
      id: 'residualCalc',
      title: 'Residual Risk Calculator',
      description: 'Auto-calculate residual risk after control implementation',
      icon: TrendingDown,
      color: 'from-violet-500 to-purple-500',
      benefit: 'Instant calculation'
    },
    {
      id: 'reviewScheduling',
      title: 'Review Scheduling',
      description: 'Automatically schedule periodic risk reviews',
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      benefit: 'Never miss reviews'
    },
    {
      id: 'escalationAlerts',
      title: 'Risk Escalation Alerts',
      description: 'Alert stakeholders when risk scores exceed thresholds',
      icon: AlertTriangle,
      color: 'from-rose-500 to-red-500',
      benefit: 'Instant notifications'
    },
    {
      id: 'trendAnalysis',
      title: 'Trend Analysis Engine',
      description: 'Identify emerging risk patterns and trends',
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-500',
      benefit: 'Predictive insights'
    },
    {
      id: 'reportGeneration',
      title: 'Risk Report Generation',
      description: 'Generate executive risk reports automatically',
      icon: FileText,
      color: 'from-slate-500 to-gray-500',
      benefit: 'Weekly reports'
    }
  ];

  const toggleWorkflow = (id) => {
    setWorkflows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCount = Object.values(workflows).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5 text-rose-400" />
              <span className="text-sm text-slate-400">Active Workflows</span>
            </div>
            <div className="text-3xl font-bold text-white">{activeCount}</div>
            <p className="text-xs text-rose-400 mt-1">of {workflowConfig.length} available</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-slate-400">Automation Rate</span>
            </div>
            <div className="text-3xl font-bold text-white">{Math.round((activeCount / workflowConfig.length) * 100)}%</div>
            <p className="text-xs text-emerald-400 mt-1">Risk management automated</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-slate-400">Time Saved</span>
            </div>
            <div className="text-3xl font-bold text-white">{activeCount * 10}h</div>
            <p className="text-xs text-blue-400 mt-1">Per month estimate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Risk Treatment Workflows</CardTitle>
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
                      ? 'bg-gradient-to-br from-rose-500/5 to-orange-500/5 border-rose-500/20' 
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
                          <Badge className="bg-rose-500/20 text-rose-400 text-xs">
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