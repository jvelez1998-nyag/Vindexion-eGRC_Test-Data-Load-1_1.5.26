import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Shield, Lock, FileText, Search, ExternalLink, Building, Scale, Users, AlertTriangle, Database, Globe } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const nydfsRegulations = [
  {
    category: "Cybersecurity Requirements",
    icon: Lock,
    color: "blue",
    regulations: [
      { 
        id: "part-500", 
        title: "23 NYCRR Part 500 - Cybersecurity Requirements", 
        topics: ["Risk Assessment", "Access Controls", "Incident Response", "Third-Party Service Providers", "Multi-Factor Authentication", "Encryption"],
        sections: ["§500.02 Cybersecurity Program", "§500.03 Chief Information Security Officer", "§500.04 Risk Assessment", "§500.05 Access Privileges", "§500.06 Penetration Testing", "§500.14 Training"],
        effective: "March 1, 2017",
        updated: "November 1, 2023"
      }
    ]
  },
  {
    category: "Banking & Lending",
    icon: Building,
    color: "emerald",
    regulations: [
      { 
        id: "part-3", 
        title: "Part 3 - Assessments", 
        topics: ["Assessment Rates", "Payment Schedules", "Fee Structures"],
        sections: ["§3.1 Banking Institutions", "§3.2 Licensed Lenders", "§3.3 Calculation Methods"],
        effective: "Various"
      },
      { 
        id: "part-36", 
        title: "Part 36 - Consumer Protection", 
        topics: ["Prohibited Practices", "Disclosure Requirements", "Fair Lending"],
        sections: ["§36.1 Unfair Practices", "§36.2 Lending Standards", "§36.3 Fee Limitations"],
        effective: "Various"
      },
      {
        id: "part-410",
        title: "Part 410 - Virtual Currency",
        topics: ["BitLicense Requirements", "Capital Requirements", "Consumer Protection", "AML/KYC"],
        sections: ["§410.4 Business Activity License", "§410.8 Capital Requirements", "§410.9 Custody and Protection"],
        effective: "June 24, 2015"
      }
    ]
  },
  {
    category: "Insurance",
    icon: Shield,
    color: "violet",
    regulations: [
      { 
        id: "part-216", 
        title: "Part 216 - Life Insurance and Annuities", 
        topics: ["Standards of Conduct", "Disclosure", "Product Suitability"],
        sections: ["§216.4 Standards of Conduct", "§216.5 Disclosure Requirements", "§216.6 Suitability"],
        effective: "February 1, 2019"
      },
      {
        id: "part-419",
        title: "Part 419 - Cybersecurity Requirements for Insurance",
        topics: ["Information Security Program", "Risk Assessment", "Third-Party Oversight"],
        sections: ["§419.3 Cybersecurity Program", "§419.5 Risk Assessment", "§419.7 Third-Party Service Providers"],
        effective: "March 1, 2020"
      }
    ]
  }
];

const nydfsGuidance = [
  {
    number: "2023-DFS-01",
    title: "Artificial Intelligence and Machine Learning Governance",
    date: "April 2023",
    category: "Technology",
    summary: "Guidance on AI/ML risk management for financial services",
    topics: ["AI Governance", "Model Risk", "Bias & Fairness", "Explainability", "Third-Party AI"]
  },
  {
    number: "2023-DFS-02",
    title: "Ransomware and Cyber Extortion",
    date: "June 2023",
    category: "Cybersecurity",
    summary: "Enhanced requirements for ransomware prevention and response",
    topics: ["Prevention Controls", "Incident Response", "Ransom Payment Reporting", "Recovery Planning"]
  },
  {
    number: "2022-DFS-05",
    title: "Cloud Computing and Third-Party Risk",
    date: "September 2022",
    category: "Technology",
    summary: "Cloud service provider oversight and risk management",
    topics: ["Cloud Risk Assessment", "Vendor Due Diligence", "Data Residency", "Exit Planning"]
  },
  {
    number: "2021-DFS-04",
    title: "Transaction Monitoring and Filtering Programs",
    date: "December 2021",
    category: "BSA/AML",
    summary: "Enhanced AML program requirements and sanctions screening",
    topics: ["TM Systems", "Sanctions Screening", "Alert Investigation", "Model Validation"]
  },
  {
    number: "2020-DFS-03",
    title: "Financial Institution Foreign Correspondent Banking",
    date: "March 2020",
    category: "BSA/AML",
    summary: "Enhanced due diligence for correspondent banking relationships",
    topics: ["CDD Requirements", "Risk Assessment", "Ongoing Monitoring", "Documentation"]
  }
];

const part500Requirements = [
  {
    section: "§500.02 Cybersecurity Program",
    icon: Shield,
    color: "blue",
    requirements: [
      "Identify and assess internal and external cybersecurity risks",
      "Use defensive infrastructure and implement policies to protect information systems",
      "Detect, respond to, and recover from cybersecurity events",
      "Fulfill regulatory reporting obligations to DFS"
    ]
  },
  {
    section: "§500.03 Chief Information Security Officer (CISO)",
    icon: Users,
    color: "violet",
    requirements: [
      "Designate a qualified CISO or equivalent",
      "CISO reports to board of directors or senior officer",
      "CISO oversees and implements cybersecurity program",
      "Annual written report to board of directors"
    ]
  },
  {
    section: "§500.04 Penetration Testing & Vulnerability Assessment",
    icon: AlertTriangle,
    color: "rose",
    requirements: [
      "Annual penetration testing and bi-annual vulnerability assessments",
      "Conducted by qualified internal or external resources",
      "Testing based on identified risks",
      "Report findings to senior management and board"
    ]
  },
  {
    section: "§500.05 Audit Trail",
    icon: FileText,
    color: "amber",
    requirements: [
      "Maintain audit trail to detect unauthorized access",
      "Reconstruct material financial transactions",
      "Protect audit trail from tampering",
      "Retain for at least five years"
    ]
  },
  {
    section: "§500.07 Access Privileges",
    icon: Lock,
    color: "emerald",
    requirements: [
      "Limit user access privileges to information systems",
      "Provide access based on job function (least privilege)",
      "Review and update access privileges periodically",
      "Disable or delete access for terminated users promptly"
    ]
  },
  {
    section: "§500.09 Third-Party Service Provider Security",
    icon: Users,
    color: "cyan",
    requirements: [
      "Identify and assess security risks from third parties",
      "Due diligence when selecting providers",
      "Minimum cybersecurity standards in contracts",
      "Periodic assessment of third-party security"
    ]
  },
  {
    section: "§500.12 Multi-Factor Authentication (MFA)",
    icon: Lock,
    color: "indigo",
    requirements: [
      "MFA for accessing internal networks from external networks",
      "MFA for privileged accounts or accounts with access to non-public information",
      "Risk-based authentication for customer accounts",
      "Implementation based on risk assessment"
    ]
  },
  {
    section: "§500.15 Encryption of Non-Public Information",
    icon: Database,
    color: "purple",
    requirements: [
      "Encryption of non-public information in transit over external networks",
      "Encryption of non-public information at rest",
      "May use effective alternative compensating controls",
      "Document risk assessment for non-encrypted data"
    ]
  },
  {
    section: "§500.17 Incident Response Plan",
    icon: AlertTriangle,
    color: "orange",
    requirements: [
      "Written incident response plan approved by senior officer or board",
      "Goals of incident response and role of CISO",
      "Internal processes for responding to cybersecurity events",
      "Communication procedures with external parties",
      "Requirements for remediation and documentation",
      "Regular testing and review of plan"
    ]
  }
];

const nydfsExamFocus = [
  {
    area: "Cybersecurity Compliance (Part 500)",
    icon: Lock,
    color: "blue",
    description: "Primary focus on cybersecurity program implementation",
    keyAreas: [
      "CISO designation and reporting structure",
      "Annual cybersecurity risk assessment completion",
      "Penetration testing and vulnerability assessments conducted",
      "Audit trail systems and retention",
      "Multi-factor authentication implementation",
      "Encryption of data in transit and at rest",
      "Third-party service provider management",
      "Incident response plan and testing",
      "Annual compliance certification filed with DFS"
    ]
  },
  {
    area: "BSA/AML Program",
    icon: Scale,
    color: "violet",
    description: "Anti-money laundering and sanctions compliance",
    keyAreas: [
      "Written AML program approved by board",
      "Transaction monitoring system effectiveness",
      "Sanctions screening (OFAC, UN, etc.)",
      "Suspicious Activity Report (SAR) filing",
      "Customer due diligence (CDD) procedures",
      "Enhanced due diligence for high-risk customers",
      "Independent testing and audit",
      "Training program for employees"
    ]
  },
  {
    area: "Consumer Protection",
    icon: Users,
    color: "emerald",
    description: "Fair lending and consumer compliance",
    keyAreas: [
      "Fair lending practices and ECOA compliance",
      "Truth in Lending Act (TILA) compliance",
      "Unfair, deceptive, or abusive acts (UDAAP)",
      "Fee disclosure and limitations",
      "Complaint handling procedures",
      "Marketing and advertising review",
      "Data privacy and consumer information protection"
    ]
  },
  {
    area: "Virtual Currency (BitLicense)",
    icon: Globe,
    color: "amber",
    description: "For virtual currency businesses",
    keyAreas: [
      "Business activity license compliance",
      "Capital requirements and financial statements",
      "Custody and protection of customer assets",
      "AML/KYC program for virtual currency",
      "Cybersecurity specific to blockchain/crypto",
      "Consumer disclosure requirements",
      "Transaction monitoring for suspicious activity",
      "Books and records maintenance"
    ]
  }
];

const nydfsResources = [
  { title: "DFS.ny.gov - Official Website", url: "https://dfs.ny.gov", type: "Portal" },
  { title: "Part 500 Cybersecurity Requirements", url: "https://dfs.ny.gov/industry_guidance/cybersecurity", type: "Regulation" },
  { title: "DFS Industry Guidance and Letters", url: "https://dfs.ny.gov/industry_guidance", type: "Guidance" },
  { title: "Part 500 Compliance Certification", url: "https://dfs.ny.gov/apps_and_licensing/cybersecurity", type: "Filing" },
  { title: "Virtual Currency (BitLicense)", url: "https://dfs.ny.gov/apps_and_licensing/virtual_currency_businesses", type: "Licensing" },
  { title: "DFS Reports and Publications", url: "https://dfs.ny.gov/reports_and_publications", type: "Reports" }
];

export default function NYDFSKnowledgeCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegulation, setSelectedRegulation] = useState(null);

  const filteredRegulations = searchQuery 
    ? nydfsRegulations.filter(cat => 
        cat.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.regulations.some(r => 
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      )
    : nydfsRegulations;

  const filteredGuidance = searchQuery
    ? nydfsGuidance.filter(g =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nydfsGuidance;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-cyan-500/10 border-indigo-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                <Building className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">NYDFS Knowledge Center</h2>
                <p className="text-xs text-slate-400">New York Department of Financial Services - Regulatory Guidance</p>
              </div>
            </div>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              NY State Regulator
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search NYDFS regulations, Part 500, guidance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="part500" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="part500">Part 500 (Cyber)</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="guidance">Guidance</TabsTrigger>
          <TabsTrigger value="examfocus">Exam Focus</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="part500" className="space-y-4">
          <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-6 w-6 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    23 NYCRR Part 500 - Cybersecurity Requirements for Financial Services Companies
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                      Effective March 1, 2017
                    </Badge>
                  </h3>
                  <p className="text-sm text-slate-300 mb-3">
                    Establishes comprehensive cybersecurity requirements for covered entities, including banks, insurance companies, and other financial services institutions operating in New York.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 justify-center py-2 text-xs">
                      Risk Assessment
                    </Badge>
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 justify-center py-2 text-xs">
                      CISO Required
                    </Badge>
                    <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 justify-center py-2 text-xs">
                      Annual Certification
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {part500Requirements.map((req) => {
              const Icon = req.icon;
              return (
                <Card key={req.section} className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className={`h-5 w-5 text-${req.color}-400`} />
                      {req.section}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {req.requirements.map((requirement, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${req.color}-400 flex-shrink-0 mt-1.5`} />
                          <span>{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="regulations" className="space-y-4">
          {filteredRegulations.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.category} className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className={`h-5 w-5 text-${category.color}-400`} />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.regulations.map((regulation) => (
                      <Card key={regulation.id} className="bg-[#0f1623] border-[#2a3548] hover:border-indigo-500/40 transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white text-sm mb-2">{regulation.title}</h3>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="outline" className="text-[10px]">
                                  Effective: {regulation.effective}
                                </Badge>
                                {regulation.updated && (
                                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                                    Updated: {regulation.updated}
                                  </Badge>
                                )}
                              </div>
                              {regulation.sections && (
                                <div className="mt-3 space-y-1">
                                  <p className="text-xs text-slate-500 font-semibold">Key Sections:</p>
                                  {regulation.sections.slice(0, 3).map((section, idx) => (
                                    <p key={idx} className="text-xs text-slate-400">• {section}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 ml-3">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {regulation.topics.map((topic, idx) => (
                              <Badge key={idx} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="guidance" className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {filteredGuidance.map((guidance) => (
              <Card key={guidance.number} className="bg-[#1a2332] border-[#2a3548] hover:border-violet-500/40 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                          {guidance.number}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{guidance.category}</Badge>
                        <span className="text-xs text-slate-500">{guidance.date}</span>
                      </div>
                      <h3 className="font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">{guidance.title}</h3>
                      <p className="text-xs text-slate-400">{guidance.summary}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {guidance.topics.map((topic, idx) => (
                      <Badge key={idx} className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-[10px]">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="examfocus" className="space-y-4">
          <Card className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Scale className="h-5 w-5 text-indigo-400" />
                NYDFS Examination Priorities
              </h3>
              <p className="text-sm text-slate-300">
                Key areas of focus during NYDFS regulatory examinations and supervisory reviews.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nydfsExamFocus.map((area) => {
              const Icon = area.icon;
              return (
                <Card key={area.area} className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className={`h-5 w-5 text-${area.color}-400`} />
                      {area.area}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-400 mb-3">{area.description}</p>
                    <div className="space-y-1.5">
                      {area.keyAreas.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${area.color}-400 flex-shrink-0 mt-1.5`} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Official NYDFS Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {nydfsResources.map((resource, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:border-indigo-500/40 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      <div>
                        <p className="text-sm text-white font-medium group-hover:text-indigo-400 transition-colors">{resource.title}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">{resource.type}</Badge>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-sm">Key NYDFS Functions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Banking Supervision</span>
                      <p className="text-xs text-slate-400">State-chartered banks and trust companies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Cybersecurity</span>
                      <p className="text-xs text-slate-400">Part 500 cybersecurity requirements enforcement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Consumer Protection</span>
                      <p className="text-xs text-slate-400">Fair lending and consumer compliance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Virtual Currency</span>
                      <p className="text-xs text-slate-400">BitLicense and crypto regulation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Insurance Regulation</span>
                      <p className="text-xs text-slate-400">Life, health, and property insurance oversight</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}