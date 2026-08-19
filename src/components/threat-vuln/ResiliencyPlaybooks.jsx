import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const PLAYBOOKS = [
  {
    id: "zero_day",
    title: "Zero-Day Vulnerability Response",
    description: "Rapid response procedures for zero-day exploits",
    severity: "critical",
    steps: [
      "Activate emergency response team",
      "Identify affected systems and scope",
      "Implement temporary mitigation controls",
      "Monitor for active exploitation attempts",
      "Apply vendor patches when available",
      "Conduct post-exploitation analysis"
    ]
  },
  {
    id: "supply_chain",
    title: "Supply Chain Attack Resiliency",
    description: "Procedures for supply chain compromise",
    severity: "critical",
    steps: [
      "Inventory all third-party dependencies",
      "Assess impact of compromised component",
      "Isolate affected applications/systems",
      "Replace compromised dependencies",
      "Implement enhanced monitoring",
      "Review vendor security practices"
    ]
  },
  {
    id: "mass_exploitation",
    title: "Mass Exploitation Event",
    description: "Response to widespread vulnerability exploitation",
    severity: "high",
    steps: [
      "Prioritize critical systems for patching",
      "Implement network segmentation",
      "Deploy virtual patching via WAF/IPS",
      "Coordinate with threat intelligence teams",
      "Execute phased remediation plan",
      "Communicate with stakeholders"
    ]
  },
  {
    id: "apt_persistence",
    title: "APT Persistence Removal",
    description: "Eliminate advanced persistent threats",
    severity: "critical",
    steps: [
      "Identify all persistence mechanisms",
      "Map lateral movement paths",
      "Coordinate simultaneous remediation",
      "Reset all credentials and keys",
      "Rebuild compromised systems",
      "Implement enhanced detection rules"
    ]
  }
];

export default function ResiliencyPlaybooks() {
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);

  return (
    <div className="space-y-6">
      {!selectedPlaybook ? (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Resiliency & Response Playbooks</CardTitle>
            <p className="text-sm text-slate-400 mt-2">
              Pre-defined procedures for critical security scenarios
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLAYBOOKS.map((playbook) => (
                <Card
                  key={playbook.id}
                  className="bg-[#151d2e] border-[#2a3548] cursor-pointer hover:border-indigo-500/40 transition-all"
                  onClick={() => setSelectedPlaybook(playbook)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-5 w-5 text-indigo-400" />
                      <Badge className={playbook.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}>
                        {playbook.severity}
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">{playbook.title}</h3>
                    <p className="text-sm text-slate-400">{playbook.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <Button
              variant="outline"
              onClick={() => setSelectedPlaybook(null)}
              className="mb-4 border-[#2a3548]"
            >
              ← Back to Playbooks
            </Button>
            <CardTitle className="text-lg">{selectedPlaybook.title}</CardTitle>
            <p className="text-sm text-slate-400 mt-2">{selectedPlaybook.description}</p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {selectedPlaybook.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-400">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{step}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-slate-600" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}