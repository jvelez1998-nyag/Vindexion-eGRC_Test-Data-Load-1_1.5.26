import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Target, Shield, FileCheck } from "lucide-react";

export default function ExaminerPersonaSelector({ selectedFramework, onSelect }) {
  const personas = {
    FFIEC: {
      icon: Shield,
      name: "FFIEC Examiner",
      style: "Methodical & Evidence-Based",
      focus: ["IT Controls", "Cybersecurity", "Vendor Management", "Incident Response"],
      approach: "Asks for specific documentation, testing evidence, and dates",
      difficulty: "High - expects detailed technical knowledge"
    },
    OCC: {
      icon: Target,
      name: "OCC Examiner",
      style: "Risk-Focused & Probing",
      focus: ["Risk Appetite", "Governance", "Loan Quality", "Capital Adequacy"],
      approach: "Challenges assumptions and tests depth of knowledge",
      difficulty: "Very High - uses scenario-based questions"
    },
    SEC: {
      icon: FileCheck,
      name: "SEC Examiner",
      style: "Compliance & Documentation",
      focus: ["Disclosure", "Internal Controls", "Financial Reporting", "SOX"],
      approach: "References specific rules and asks about control design",
      difficulty: "High - regulatory precision required"
    },
    FDIC: {
      icon: Shield,
      name: "FDIC Examiner",
      style: "Safety & Soundness",
      focus: ["Deposit Insurance", "Liquidity", "Asset Quality", "Earnings"],
      approach: "Process and policy focused with board oversight emphasis",
      difficulty: "Medium-High - thorough but structured"
    },
    NCUA: {
      icon: Brain,
      name: "NCUA Examiner",
      style: "Member-Centric & Practical",
      focus: ["Member Service", "Financial Performance", "Strategic Planning"],
      approach: "Direct questions about member impact and service delivery",
      difficulty: "Medium - practical application focus"
    }
  };

  const persona = personas[selectedFramework] || personas.FFIEC;
  const Icon = persona.icon;

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          Examiner Persona
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-lg bg-purple-500/20">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{persona.name}</h3>
            <p className="text-sm text-slate-400 mb-2">{persona.style}</p>
            <Badge className="bg-amber-500/20 text-amber-400 text-xs">
              {persona.difficulty}
            </Badge>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-2">Focus Areas:</div>
          <div className="flex flex-wrap gap-2">
            {persona.focus.map((area, idx) => (
              <Badge key={idx} className="bg-indigo-500/20 text-indigo-400 text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
          <div className="text-xs text-slate-500 mb-1">Questioning Approach:</div>
          <p className="text-xs text-slate-300">{persona.approach}</p>
        </div>

        <Button onClick={onSelect} className="w-full bg-purple-600 hover:bg-purple-700">
          <Brain className="h-4 w-4 mr-2" />
          Start Interview with {persona.name}
        </Button>
      </CardContent>
    </Card>
  );
}