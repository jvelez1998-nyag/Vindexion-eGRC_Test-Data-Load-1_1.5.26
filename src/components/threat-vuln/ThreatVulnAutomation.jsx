import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, Activity, Bell, TrendingUp, CheckCircle2 } from "lucide-react";

export default function ThreatVulnAutomation() {
  const [automations, setAutomations] = useState({
    auto_cve_import: true,
    auto_scoring: true,
    auto_prioritization: true,
    auto_assignment: true,
    threat_intel_correlation: true,
    auto_remediation_suggestions: true,
    vulnerability_scanning: true,
    compliance_mapping: true
  });

  const workflows = [
    {
      id: "auto_cve_import",
      title: "Automated CVE Import",
      description: "Automatically import and categorize new CVEs from NVD feeds",
      icon: Activity,
      color: "indigo",
      benefit: "Real-time threat awareness"
    },
    {
      id: "auto_scoring",
      title: "AI-Powered Risk Scoring",
      description: "Automatically calculate and update CVSS scores with environmental context",
      icon: TrendingUp,
      color: "emerald",
      benefit: "Accurate risk assessment"
    },
    {
      id: "auto_prioritization",
      title: "Vulnerability Prioritization",
      description: "Auto-prioritize vulnerabilities based on exploitability and business impact",
      icon: Zap,
      color: "amber",
      benefit: "Focus on what matters"
    },
    {
      id: "auto_assignment",
      title: "Smart Assignment",
      description: "Automatically assign vulnerabilities to appropriate team members",
      icon: CheckCircle2,
      color: "purple",
      benefit: "Faster remediation"
    },
    {
      id: "threat_intel_correlation",
      title: "Threat Intelligence Correlation",
      description: "Correlate vulnerabilities with active threat campaigns",
      icon: Activity,
      color: "rose",
      benefit: "Threat-aware patching"
    },
    {
      id: "auto_remediation_suggestions",
      title: "Remediation Recommendations",
      description: "AI-generated remediation guidance and patch suggestions",
      icon: CheckCircle2,
      color: "cyan",
      benefit: "Guided remediation"
    },
    {
      id: "vulnerability_scanning",
      title: "Continuous Vulnerability Scanning",
      description: "Automated scanning and discovery of new vulnerabilities",
      icon: Activity,
      color: "blue",
      benefit: "Continuous visibility"
    },
    {
      id: "compliance_mapping",
      title: "Compliance Mapping",
      description: "Auto-map vulnerabilities to compliance requirements",
      icon: CheckCircle2,
      color: "violet",
      benefit: "Regulatory alignment"
    }
  ];

  const toggleAutomation = (id) => {
    setAutomations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCount = Object.values(automations).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{activeCount}</div>
                <div className="text-sm text-slate-400">Active Workflows</div>
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
                <div className="text-3xl font-bold text-white mb-1">~30h</div>
                <div className="text-sm text-slate-400">Saved/Month</div>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Automation Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {workflows.map(workflow => {
              const Icon = workflow.icon;
              const isActive = automations[workflow.id];
              
              return (
                <Card key={workflow.id} className="bg-[#151d2e] border-[#2a3548]">
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
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => toggleAutomation(workflow.id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}