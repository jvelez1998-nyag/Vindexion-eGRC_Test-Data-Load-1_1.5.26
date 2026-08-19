import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookMarked, Search } from "lucide-react";

const glossaryTerms = [
  {
    term: "Risk Appetite",
    definition: "The amount and type of risk that an organization is willing to accept in pursuit of its objectives.",
    category: "Risk Management",
    relatedTerms: ["Risk Tolerance", "Risk Threshold"]
  },
  {
    term: "Risk Tolerance",
    definition: "The acceptable level of variation relative to achievement of objectives, often expressed as quantitative limits.",
    category: "Risk Management",
    relatedTerms: ["Risk Appetite", "Inherent Risk"]
  },
  {
    term: "Inherent Risk",
    definition: "The risk level before any controls or mitigating actions are applied.",
    category: "Risk Management",
    relatedTerms: ["Residual Risk", "Control Effectiveness"]
  },
  {
    term: "Residual Risk",
    definition: "The risk remaining after controls and mitigation efforts have been applied.",
    category: "Risk Management",
    relatedTerms: ["Inherent Risk", "Risk Treatment"]
  },
  {
    term: "Control",
    definition: "A measure that modifies or manages risk by preventing, detecting, or correcting undesirable events.",
    category: "Controls",
    relatedTerms: ["Control Effectiveness", "Preventive Control", "Detective Control"]
  },
  {
    term: "Control Effectiveness",
    definition: "The degree to which a control successfully mitigates the associated risk.",
    category: "Controls",
    relatedTerms: ["Control Testing", "Control Design", "Operating Effectiveness"]
  },
  {
    term: "SOD (Segregation of Duties)",
    definition: "Division of responsibilities among different people to reduce the risk of error or fraud.",
    category: "Controls",
    relatedTerms: ["Access Control", "Internal Controls", "Compensating Controls"]
  },
  {
    term: "Compliance Framework",
    definition: "A structured set of guidelines and requirements for regulatory or industry compliance.",
    category: "Compliance",
    relatedTerms: ["Regulatory Requirement", "Control Objective", "Compliance Assessment"]
  },
  {
    term: "Gap Analysis",
    definition: "Process of identifying differences between current state and desired compliance or control state.",
    category: "Compliance",
    relatedTerms: ["Remediation Plan", "Compliance Assessment", "Control Maturity"]
  },
  {
    term: "GDPR (General Data Protection Regulation)",
    definition: "EU regulation on data protection and privacy for individuals within the European Union and EEA.",
    category: "Privacy",
    relatedTerms: ["CCPA", "Data Subject Rights", "DPO"]
  },
  {
    term: "DSAR (Data Subject Access Request)",
    definition: "A request from an individual to access their personal data held by an organization.",
    category: "Privacy",
    relatedTerms: ["GDPR", "Data Subject Rights", "Right to Access"]
  },
  {
    term: "PIA (Privacy Impact Assessment)",
    definition: "Process to identify and minimize privacy risks of a project or system involving personal data.",
    category: "Privacy",
    relatedTerms: ["DPIA", "Privacy by Design", "Data Processing"]
  },
  {
    term: "Third-Party Risk",
    definition: "Risk arising from outsourcing to or partnering with external vendors or service providers.",
    category: "Vendor Management",
    relatedTerms: ["Vendor Risk Assessment", "Due Diligence", "SLA"]
  },
  {
    term: "SLA (Service Level Agreement)",
    definition: "Contract defining expected service standards and performance metrics between provider and client.",
    category: "Vendor Management",
    relatedTerms: ["KPI", "Vendor Performance", "Contract Management"]
  },
  {
    term: "KRI (Key Risk Indicator)",
    definition: "Metric used to provide early warning signals of increasing risk exposures.",
    category: "Risk Management",
    relatedTerms: ["KPI", "Risk Monitoring", "Early Warning"]
  },
  {
    term: "KPI (Key Performance Indicator)",
    definition: "Measurable value demonstrating how effectively objectives are being achieved.",
    category: "Performance",
    relatedTerms: ["KRI", "Performance Metrics", "Dashboard"]
  },
  {
    term: "Audit Finding",
    definition: "Identified deficiency, weakness, or non-compliance issue discovered during an audit.",
    category: "Audit",
    relatedTerms: ["Audit Observation", "Management Response", "Remediation"]
  },
  {
    term: "Remediation",
    definition: "Actions taken to correct identified deficiencies, weaknesses, or non-compliance issues.",
    category: "Audit",
    relatedTerms: ["Corrective Action", "Finding", "Management Action Plan"]
  },
  {
    term: "Incident Response",
    definition: "Organized approach to addressing and managing security breaches or cyberattacks.",
    category: "Security",
    relatedTerms: ["Incident Management", "Breach Response", "Containment"]
  },
  {
    term: "Threat Intelligence",
    definition: "Evidence-based knowledge about existing or emerging threats that can inform decision-making.",
    category: "Security",
    relatedTerms: ["Vulnerability", "CVE", "Threat Actor"]
  },
  {
    term: "CVE (Common Vulnerabilities and Exposures)",
    definition: "Publicly disclosed security vulnerabilities and exposures with unique identifiers.",
    category: "Security",
    relatedTerms: ["Vulnerability Management", "Patch Management", "Threat Intelligence"]
  },
  {
    term: "Risk Heat Map",
    definition: "Visual representation plotting risks based on likelihood and impact dimensions.",
    category: "Risk Management",
    relatedTerms: ["Risk Matrix", "Risk Assessment", "Risk Visualization"]
  },
  {
    term: "Control Testing",
    definition: "Process of evaluating whether controls are designed and operating effectively.",
    category: "Controls",
    relatedTerms: ["Control Effectiveness", "Test Procedures", "Evidence"]
  },
  {
    term: "Compensating Control",
    definition: "Alternative control implemented when the primary control cannot be used effectively.",
    category: "Controls",
    relatedTerms: ["Control Framework", "Preventive Control", "Detective Control"]
  },
  {
    term: "Risk Treatment",
    definition: "Process of selecting and implementing measures to modify risk (Accept, Mitigate, Transfer, Avoid).",
    category: "Risk Management",
    relatedTerms: ["Risk Response", "Risk Mitigation", "Risk Transfer"]
  },
  {
    term: "Continuous Monitoring",
    definition: "Ongoing observation and assessment of controls and risks in real-time or near real-time.",
    category: "Monitoring",
    relatedTerms: ["Automated Monitoring", "KRI", "Real-time Alerting"]
  },
  {
    term: "Attestation",
    definition: "Formal declaration or certification confirming compliance, accuracy, or completion.",
    category: "Compliance",
    relatedTerms: ["Certification", "Sign-off", "Compliance Declaration"]
  },
  {
    term: "Risk Register",
    definition: "Document or database listing identified risks with details on likelihood, impact, and treatment.",
    category: "Risk Management",
    relatedTerms: ["Risk Inventory", "Risk Log", "Risk Profile"]
  },
  {
    term: "Vulnerability Assessment",
    definition: "Process of identifying, quantifying, and prioritizing security vulnerabilities in systems.",
    category: "Security",
    relatedTerms: ["Penetration Testing", "Security Assessment", "Vulnerability Scanning"]
  },
  {
    term: "Business Continuity",
    definition: "Capability to continue essential business functions during and after a disaster or disruption.",
    category: "Resilience",
    relatedTerms: ["Disaster Recovery", "BCP", "Resilience Planning"]
  },
  {
    term: "RTO (Recovery Time Objective)",
    definition: "Targeted duration within which a process must be restored after a disruption.",
    category: "Resilience",
    relatedTerms: ["RPO", "Business Continuity", "Disaster Recovery"]
  }
];

export default function GlossarySection() {
  const [search, setSearch] = useState("");

  const categories = [...new Set(glossaryTerms.map(t => t.category))].sort();

  const filteredTerms = glossaryTerms.filter(term =>
    term.term.toLowerCase().includes(search.toLowerCase()) ||
    term.definition.toLowerCase().includes(search.toLowerCase()) ||
    term.category.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-600">
              <BookMarked className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">GRC Glossary</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Key terms and definitions for governance, risk, and compliance</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search terms or definitions..."
              className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => {
          const count = filteredTerms.filter(t => t.category === cat).length;
          return (
            <Badge key={cat} className="bg-indigo-500/20 text-indigo-400">
              {cat} ({count})
            </Badge>
          );
        })}
      </div>

      <div className="grid gap-3">
        {filteredTerms.map((term, idx) => (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-bold text-white">{term.term}</h3>
                <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                  {term.category}
                </Badge>
              </div>
              <p className="text-sm text-slate-300 mb-3">{term.definition}</p>
              {term.relatedTerms && term.relatedTerms.length > 0 && (
                <div className="pt-3 border-t border-[#2a3548]">
                  <div className="text-xs text-slate-500 mb-2">Related Terms:</div>
                  <div className="flex flex-wrap gap-1">
                    {term.relatedTerms.map((related, relIdx) => (
                      <Badge key={relIdx} variant="outline" className="text-xs border-[#2a3548] text-slate-400">
                        {related}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
          <p className="text-slate-400">No terms found matching your search.</p>
        </Card>
      )}
    </div>
  );
}