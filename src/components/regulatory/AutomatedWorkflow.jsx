import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Zap, Settings, CheckCircle2, AlertTriangle, Calendar, Mail, Bot } from "lucide-react";
import { toast } from "sonner";

export default function AutomatedWorkflow({ exams, userEmail }) {
  const [automationRules, setAutomationRules] = useState({
    autoScheduleRetakes: true,
    autoGenerateStudyPlans: true,
    emailReminders: true,
    adaptiveDifficulty: true,
    progressNotifications: true,
    weaknessAlerts: true
  });

  const handleToggle = (rule) => {
    setAutomationRules(prev => ({ ...prev, [rule]: !prev[rule] }));
    toast.success(`Automation rule ${!automationRules[rule] ? 'enabled' : 'disabled'}`);
  };

  const workflows = [
    {
      id: "autoScheduleRetakes",
      title: "Auto-Schedule Retakes",
      description: "Automatically schedule exam retakes when scores fall below passing threshold",
      icon: Calendar,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      id: "autoGenerateStudyPlans",
      title: "Auto-Generate Study Plans",
      description: "Create personalized study plans immediately after exam completion based on weak areas",
      icon: Bot,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10"
    },
    {
      id: "emailReminders",
      title: "Email Reminders",
      description: "Send automated email reminders for scheduled exams and study milestones",
      icon: Mail,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10"
    },
    {
      id: "adaptiveDifficulty",
      title: "Adaptive Difficulty",
      description: "Automatically adjust exam difficulty based on performance trends",
      icon: Settings,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
    {
      id: "progressNotifications",
      title: "Progress Notifications",
      description: "Receive notifications when you reach study milestones and learning objectives",
      icon: CheckCircle2,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      id: "weaknessAlerts",
      title: "Weakness Alerts",
      description: "Get alerted when patterns indicate persistent knowledge gaps requiring intervention",
      icon: AlertTriangle,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10"
    }
  ];

  // Automation insights
  const completedExams = exams.filter(e => e.status === 'passed' || e.status === 'failed');
  const failedExams = exams.filter(e => e.status === 'failed');
  const automationPotential = failedExams.length + (completedExams.length * 0.3); // Estimate

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="h-6 w-6 text-purple-400" />
              Workflow Automation Engine
            </h2>
            <p className="text-slate-300 mb-4 max-w-2xl">
              Configure intelligent automation rules to streamline your exam preparation workflow. 
              AI will handle routine tasks, scheduling, and adaptive recommendations automatically.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-[#1a2332] border border-[#2a3548] rounded-lg text-center">
            <div className="text-3xl font-bold text-white mb-1">{Object.values(automationRules).filter(Boolean).length}</div>
            <div className="text-xs text-slate-400">Active Rules</div>
          </div>
          <div className="p-4 bg-[#1a2332] border border-[#2a3548] rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">{Math.round(automationPotential)}</div>
            <div className="text-xs text-slate-400">Actions Automated</div>
          </div>
          <div className="p-4 bg-[#1a2332] border border-[#2a3548] rounded-lg text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{Math.round(automationPotential * 2.5)}h</div>
            <div className="text-xs text-slate-400">Time Saved</div>
          </div>
        </div>
      </Card>

      {/* Automation Rules */}
      <div className="grid lg:grid-cols-2 gap-6">
        {workflows.map(workflow => {
          const Icon = workflow.icon;
          const isEnabled = automationRules[workflow.id];
          
          return (
            <Card key={workflow.id} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${workflow.bgColor}`}>
                      <Icon className={`h-6 w-6 ${workflow.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{workflow.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{workflow.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-[#2a3548]">
                  <Badge className={isEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}>
                    {isEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={workflow.id} className="text-sm text-slate-400">
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </Label>
                    <Switch
                      id={workflow.id}
                      checked={isEnabled}
                      onCheckedChange={() => handleToggle(workflow.id)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Automation Insights */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-400" />
            Automation Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-violet-500/5 border border-violet-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-violet-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white mb-1">Smart Scheduling Active</h4>
                <p className="text-sm text-slate-400">
                  System will automatically schedule follow-up exams based on your performance patterns and optimal retention curves.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white mb-1">Adaptive Learning Enabled</h4>
                <p className="text-sm text-slate-400">
                  AI continuously adjusts question difficulty and focus areas to match your evolving skill level and knowledge gaps.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white mb-1">Proactive Intervention</h4>
                <p className="text-sm text-slate-400">
                  System monitors for signs of struggle and automatically provides targeted resources before performance declines.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}