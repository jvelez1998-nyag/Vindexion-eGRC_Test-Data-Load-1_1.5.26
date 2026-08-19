import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, AlertTriangle, FileCheck, Users, TrendingUp, Database, ArrowRight } from "lucide-react";

const quickRefData = [
  {
    icon: AlertTriangle,
    category: "Risk Management",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    quickTips: [
      { action: "Create Risk", path: "Risk Management → + New Risk", shortcut: "Auto-scoring available" },
      { action: "AI Risk Analysis", path: "Risk Management → AI Analysis", shortcut: "Predictive insights" },
      { action: "Risk Heat Map", path: "Dashboard → Risk Heat Map", shortcut: "Visual risk overview" },
      { action: "Link to Controls", path: "Risk Detail → Controls Tab", shortcut: "Map mitigations" }
    ]
  },
  {
    icon: Shield,
    category: "Compliance",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    quickTips: [
      { action: "Track Framework", path: "Compliance Frameworks → Select Framework", shortcut: "30+ frameworks" },
      { action: "Gap Analysis", path: "Compliance → Gap Analysis", shortcut: "Auto-identify gaps" },
      { action: "Cross-Walk Mapping", path: "Cross-Walk Mapping → Create Mapping", shortcut: "Reduce redundancy" },
      { action: "Evidence Upload", path: "Compliance → Evidence", shortcut: "Bulk upload supported" }
    ]
  },
  {
    icon: FileCheck,
    category: "Audit & Assessment",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    quickTips: [
      { action: "Create Audit", path: "Audits → + New Audit", shortcut: "Templates available" },
      { action: "AI Audit Prep", path: "Audits → AI Assistant", shortcut: "Auto-generate programs" },
      { action: "Exam Simulator", path: "Regulatory Exams → Start Simulation", shortcut: "Practice exams" },
      { action: "Findings Tracker", path: "Audits → Findings", shortcut: "Remediation tracking" }
    ]
  },
  {
    icon: Users,
    category: "Vendor Management",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    quickTips: [
      { action: "Add Vendor", path: "Third Party → + New Vendor", shortcut: "Risk tiering auto" },
      { action: "Assessment", path: "Vendor Detail → Assessments", shortcut: "Questionnaires ready" },
      { action: "Performance KPIs", path: "Vendor → Performance Tab", shortcut: "SLA tracking" },
      { action: "Vendor Portal", path: "Vendor Portal", shortcut: "External access" }
    ]
  },
  {
    icon: TrendingUp,
    category: "Analytics & Insights",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    quickTips: [
      { action: "AI Insights", path: "Advanced Insights Dashboard", shortcut: "Strategic intelligence" },
      { action: "Custom Reports", path: "Reports → Custom Builder", shortcut: "Drag-and-drop" },
      { action: "Predictive Analytics", path: "Advanced Insights → Predictions", shortcut: "ML-powered" },
      { action: "Heat Maps", path: "Dashboard → Risk Heatmap", shortcut: "Interactive viz" }
    ]
  },
  {
    icon: Database,
    category: "Automation",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    quickTips: [
      { action: "Workflow Rules", path: "Workflow Automation → Rules", shortcut: "Trigger-based" },
      { action: "Auto-Assignments", path: "Automation → Task Assignment", shortcut: "AI-powered" },
      { action: "Notifications", path: "Notification Settings", shortcut: "Customize alerts" },
      { action: "Scheduled Tasks", path: "Automation → Schedules", shortcut: "Recurring jobs" }
    ]
  }
];

export default function QuickReference() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Quick Reference Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Fast access to common workflows and actions</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {quickRefData.map((section, idx) => (
          <Card key={idx} className={`bg-[#1a2332] border ${section.borderColor}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${section.bgColor}`}>
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <CardTitle className="text-base text-white">{section.category}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.quickTips.map((tip, tipIdx) => (
                  <div key={tipIdx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:border-indigo-500/30 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm mb-1">{tip.action}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          {tip.path}
                        </div>
                      </div>
                      <Badge className="bg-indigo-500/20 text-indigo-400 text-xs whitespace-nowrap">
                        {tip.shortcut}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white">Platform Navigation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <div className="text-emerald-400 font-medium text-sm mb-1">Global Search</div>
              <p className="text-xs text-slate-400">Use the search bar to find any entity across modules</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="text-blue-400 font-medium text-sm mb-1">Bulk Operations</div>
              <p className="text-xs text-slate-400">Import/Export available for all major entities</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="text-purple-400 font-medium text-sm mb-1">AI Assistant</div>
              <p className="text-xs text-slate-400">Click the AI icon for contextual help and insights</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="text-amber-400 font-medium text-sm mb-1">Linking Entities</div>
              <p className="text-xs text-slate-400">Connect risks, controls, audits, and more for traceability</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20">
              <div className="text-rose-400 font-medium text-sm mb-1">Notifications</div>
              <p className="text-xs text-slate-400">Customize alerts in Notification Settings</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <div className="text-indigo-400 font-medium text-sm mb-1">Dashboard Views</div>
              <p className="text-xs text-slate-400">Create custom dashboards with personalized widgets</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}