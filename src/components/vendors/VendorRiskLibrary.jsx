import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, BookOpen, Shield, FileText } from "lucide-react";

const riskLibrary = [
  {
    category: "Third-Party Risk Frameworks",
    items: [
      {
        title: "NIST SP 800-161",
        subtitle: "Supply Chain Risk Management",
        description: "Comprehensive framework for managing cybersecurity risks in supply chains",
        tags: ["NIST", "Supply Chain", "Cybersecurity"]
      },
      {
        title: "ISO 27036",
        subtitle: "Information Security for Supplier Relationships",
        description: "International standard for managing information security in supplier relationships",
        tags: ["ISO", "Security", "Suppliers"]
      },
      {
        title: "SHARED ASSESSMENTS",
        subtitle: "Standardized Information Gathering (SIG)",
        description: "Industry-standard questionnaire for vendor risk assessment",
        tags: ["Assessment", "Questionnaire", "Industry Standard"]
      }
    ]
  },
  {
    category: "Vendor Due Diligence",
    items: [
      {
        title: "Initial Vendor Assessment",
        subtitle: "Pre-engagement evaluation criteria",
        description: "Key factors to evaluate before engaging a new vendor",
        tags: ["Due Diligence", "Assessment", "Onboarding"]
      },
      {
        title: "Financial Stability Analysis",
        subtitle: "Evaluating vendor financial health",
        description: "Metrics and indicators for assessing vendor financial viability",
        tags: ["Financial", "Risk", "Analysis"]
      },
      {
        title: "Security Posture Assessment",
        subtitle: "Cybersecurity evaluation framework",
        description: "Comprehensive security controls and capabilities assessment",
        tags: ["Security", "Controls", "Assessment"]
      }
    ]
  },
  {
    category: "Contract Management",
    items: [
      {
        title: "SLA Requirements",
        subtitle: "Service Level Agreement best practices",
        description: "Essential SLA components and negotiation strategies",
        tags: ["SLA", "Contracts", "Agreements"]
      },
      {
        title: "Data Processing Agreements",
        subtitle: "GDPR-compliant DPA templates",
        description: "Required clauses for data processor relationships",
        tags: ["GDPR", "Data Protection", "DPA"]
      },
      {
        title: "Right to Audit Clauses",
        subtitle: "Ensuring audit rights in contracts",
        description: "Standard language for vendor audit provisions",
        tags: ["Audit", "Contracts", "Compliance"]
      }
    ]
  },
  {
    category: "Ongoing Monitoring",
    items: [
      {
        title: "Continuous Monitoring Program",
        subtitle: "Real-time vendor risk tracking",
        description: "Framework for continuous vendor risk assessment",
        tags: ["Monitoring", "Continuous", "Real-time"]
      },
      {
        title: "Performance Metrics",
        subtitle: "KPIs for vendor performance",
        description: "Key performance indicators to track vendor effectiveness",
        tags: ["KPI", "Performance", "Metrics"]
      },
      {
        title: "Incident Response Plans",
        subtitle: "Vendor incident management",
        description: "Procedures for managing vendor-related incidents",
        tags: ["Incident", "Response", "Management"]
      }
    ]
  }
];

export default function VendorRiskLibrary() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLibrary = riskLibrary.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Vendor Risk Management Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm mb-4">
            Comprehensive library of frameworks, best practices, and guidelines for vendor risk management
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search frameworks, topics, or tags..."
              className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
            />
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[700px]">
        <div className="space-y-6 pr-4">
          {filteredLibrary.map((category, catIdx) => (
            <div key={catIdx}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                {category.category}
              </h3>
              <div className="grid lg:grid-cols-2 gap-4">
                {category.items.map((item, itemIdx) => (
                  <Card key={itemIdx} className="bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558] transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm text-white">{item.title}</CardTitle>
                          <p className="text-xs text-indigo-400 mt-1">{item.subtitle}</p>
                        </div>
                        <FileText className="h-5 w-5 text-emerald-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-400 mb-3">{item.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, tagIdx) => (
                          <Badge key={tagIdx} className="bg-emerald-500/20 text-emerald-400 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}