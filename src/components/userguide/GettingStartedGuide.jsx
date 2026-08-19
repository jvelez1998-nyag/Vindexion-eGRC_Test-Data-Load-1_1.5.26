import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Rocket, CheckCircle2, LayoutDashboard, AlertTriangle, 
  FileCheck, Shield, Users, Settings, Zap, ArrowRight 
} from "lucide-react";

export default function GettingStartedGuide() {
  const steps = [
    {
      number: 1,
      title: "Explore the Dashboard",
      description: "Get familiar with the main dashboard showing your GRC posture overview",
      icon: LayoutDashboard,
      action: "View Dashboard",
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: 2,
      title: "Set Up Your Risk Register",
      description: "Add your organization's key risks using manual entry or AI Risk Analyzer",
      icon: AlertTriangle,
      action: "Add Risks",
      color: "from-rose-500 to-orange-500"
    },
    {
      number: 3,
      title: "Configure Compliance Requirements",
      description: "Import or create compliance requirements for applicable frameworks (SOX, SOC2, ISO, GDPR)",
      icon: FileCheck,
      action: "Setup Compliance",
      color: "from-emerald-500 to-teal-500"
    },
    {
      number: 4,
      title: "Document Your Controls",
      description: "Define security and operational controls, linking them to risks and compliance",
      icon: Shield,
      action: "Create Controls",
      color: "from-purple-500 to-pink-500"
    },
    {
      number: 5,
      title: "Invite Your Team",
      description: "Add team members and assign appropriate roles (Admin, User, Auditor)",
      icon: Users,
      action: "Manage Users",
      color: "from-amber-500 to-yellow-500"
    }
  ];

  const quickWins = [
    { title: "Use AI Risk Analyzer", description: "Describe a scenario and let AI identify risks for you", time: "2 min" },
    { title: "Import Framework Requirements", description: "Bulk import compliance requirements from templates", time: "5 min" },
    { title: "Link Entities", description: "Connect risks to controls and compliance items for better visibility", time: "10 min" },
    { title: "Schedule First Audit", description: "Set up your first internal or external audit", time: "5 min" }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <Rocket className="h-10 w-10 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Vindexion eGRC Hub™</h2>
              <p className="text-slate-300">Your comprehensive platform for Governance, Risk, and Compliance management</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <Badge className="bg-indigo-500/20 text-indigo-400 text-sm py-1">
              <Zap className="h-3 w-3 mr-1" />
              5-Minute Setup
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 text-sm py-1">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 text-sm py-1">
              Enterprise Ready
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-xl">5-Step Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="bg-[#151d2e] border-[#2a3548] hover:border-indigo-500/40 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3">
                          <span className="text-lg font-bold text-indigo-400">{step.number}</span>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${step.color}/20`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                        <p className="text-slate-400 text-sm mb-4">{step.description}</p>
                        <Button variant="outline" size="sm" className="border-[#2a3548]">
                          {step.action}
                          <ArrowRight className="h-3 w-3 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Quick Wins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickWins.map((win, idx) => (
              <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{win.title}</h4>
                    <Badge className="bg-amber-500/10 text-amber-400 text-xs">{win.time}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">{win.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-xl">Key Platform Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Risk Management', description: 'Identify, assess, and monitor organizational risks', icon: AlertTriangle },
              { title: 'Compliance Tracking', description: 'Manage requirements across multiple frameworks', icon: FileCheck },
              { title: 'Control Management', description: 'Document and test security controls', icon: Shield },
              { title: 'Audit Management', description: 'Plan and track internal and external audits', icon: Settings },
              { title: 'AI-Powered Insights', description: 'Get intelligent recommendations and analysis', icon: Zap },
              { title: 'Reporting & Analytics', description: 'Generate comprehensive GRC reports', icon: LayoutDashboard }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <Icon className="h-5 w-5 text-indigo-400 mb-2" />
                  <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-xs text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}